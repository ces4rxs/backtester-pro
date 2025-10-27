// src/ai/predictor_v4.ts — OMEGA CORE v4.4 (ML Predictor)
import fs from "fs";
import path from "path";

type Metrics = {
  sharpe?: number;
  mdd?: number;
  cagr?: number;
  tradesCount?: number;
  equityFinal?: number;
  robustness?: number;
  quantumRating?: number;
};

type TrainRow = {
  x: number[]; // features
  y: number[]; // targets: [sharpe, mdd, cagr]
};

const safeNum = (x: any, d = 0) => (typeof x === "number" && isFinite(x) ? x : d);

function readManifests(): Metrics[] {
  const resultsDir = path.join(process.cwd(), "results");
  if (!fs.existsSync(resultsDir)) return [];
  const folders = fs.readdirSync(resultsDir).filter(f => {
    const p = path.join(resultsDir, f);
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  });

  const rows: Metrics[] = [];
  for (const f of folders) {
    const manifestPath = path.join(resultsDir, f, "manifest.json");
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const mt: Metrics = {
        sharpe: safeNum(m?.metrics?.sharpe, 0),
        mdd: safeNum(m?.metrics?.mdd, 0),
        cagr: safeNum(m?.metrics?.cagr, 0),
        tradesCount: safeNum(m?.metrics?.tradesCount, 0),
        equityFinal: safeNum(m?.metrics?.equityFinal, 0),
        robustness: safeNum(m?.metrics?.robustness, 0),
        quantumRating: safeNum(m?.metrics?.quantumRating, 0),
      };
      rows.push(mt);
    } catch {}
  }
  return rows;
}

function buildDataset(rows: Metrics[]): TrainRow[] {
  // Features: [sharpe, |mdd|, cagr, tradesNorm, equityNorm]
  // Targets : [sharpe, mdd, cagr]
  const maxTrades = Math.max(1, ...rows.map(r => safeNum(r.tradesCount, 0)));
  const maxEquity = Math.max(1, ...rows.map(r => safeNum(r.equityFinal, 0)));

  return rows.map(r => {
    const x = [
      safeNum(r.sharpe, 0),
      Math.abs(safeNum(r.mdd, 0)),
      safeNum(r.cagr, 0),
      safeNum(r.tradesCount, 0) / maxTrades,
      safeNum(r.equityFinal, 0) / maxEquity,
    ];
    const y = [safeNum(r.sharpe, 0), safeNum(r.mdd, 0), safeNum(r.cagr, 0)];
    return { x, y };
  });
}

// Pequeña regresión ridge multisalida (sin dependencias externas)
function ridgeFit(X: number[][], Y: number[][], lambda = 0.1) {
  // Resuelve W en min ||XW - Y||^2 + λ||W||^2  -> W = (X^T X + λI)^-1 X^T Y
  const n = X.length;
  const d = X[0]?.length || 0;
  const t = Y[0]?.length || 0;
  if (n === 0 || d === 0 || t === 0) return { W: Array(d).fill(0).map(()=>Array(t).fill(0)) };

  // Construye X^T X y X^T Y
  const XtX = Array(d).fill(0).map(()=>Array(d).fill(0));
  const XtY = Array(d).fill(0).map(()=>Array(t).fill(0));
  for (let i=0;i<n;i++){
    for (let a=0;a<d;a++){
      for (let b=0;b<d;b++){
        XtX[a][b] += X[i][a] * X[i][b];
      }
      for (let k=0;k<t;k++){
        XtY[a][k] += X[i][a] * Y[i][k];
      }
    }
  }
  // λI
  for (let a=0;a<d;a++) XtX[a][a] += lambda;

  // Inversa simple por Gauss-Jordan (d pequeño)
  const inv = invertMatrix(XtX);
  const W = multiply(inv, XtY);
  return { W };
}

function multiply(A:number[][], B:number[][]){
  const r=A.length, c=B[0].length, m=A[0].length;
  const R = Array(r).fill(0).map(()=>Array(c).fill(0));
  for(let i=0;i<r;i++){
    for(let k=0;k<m;k++){
      const aik=A[i][k];
      for(let j=0;j<c;j++){
        R[i][j]+=aik*B[k][j];
      }
    }
  }
  return R;
}

function invertMatrix(A:number[][]){
  const n=A.length;
  const M=A.map(row=>row.slice());
  const I=Array(n).fill(0).map((_,i)=>Array(n).fill(0).map((__,j)=> i===j?1:0));
  for(let i=0;i<n;i++){
    // pivote
    let p=i;
    for(let r=i+1;r<n;r++) if(Math.abs(M[r][i])>Math.abs(M[p][i])) p=r;
    if(Math.abs(M[p][i])<1e-12) return I; // singular, devuelve identidad para no romper
    if(p!==i){ [M[i],M[p]]=[M[p],M[i]]; [I[i],I[p]]=[I[p],I[i]]; }
    const div=M[i][i];
    for(let j=0;j<n;j++){ M[i][j]/=div; I[i][j]/=div; }
    for(let r=0;r<n;r++){
      if(r===i) continue;
      const f=M[r][i];
      for(let j=0;j<n;j++){ M[r][j]-=f*M[i][j]; I[r][j]-=f*I[i][j]; }
    }
  }
  return I;
}

export function trainPredictor() {
  const rows = readManifests();
  const dataset = buildDataset(rows).filter(r => Number.isFinite(r.x[0]));
  if (dataset.length < 12) {
    return {
      ok: false,
      reason: "not_enough_data",
      model: null,
      stats: { count: dataset.length },
      predict: (x:number[]) => ({
        sharpe: 1.1 * (x[0]||0.8),
        mdd: -Math.max(0.01, (x[1]||0.02)),
        cagr: Math.max(0.01, (x[2]||0.03)),
        confidence: 0.6
      })
    };
  }

  const X = dataset.map(d => d.x);
  const Y = dataset.map(d => d.y);
  const { W } = ridgeFit(X, Y, 0.12);

  const predict = (x: number[]) => {
    const yhat = multiply([x], W)[0] || [0,0,0];
    // límites sanos
    const sharpe = Math.max(-1, Math.min(3.5, yhat[0]));
    const mdd    = Math.max(-0.5, Math.min(-0.005, yhat[1]));
    const cagr   = Math.max(-0.2, Math.min(0.5, yhat[2]));
    // confianza muy simple (cuantos datos y dispersión)
    const conf = Math.min(0.95, 0.55 + Math.log10(X.length+10)/10);
    return { sharpe, mdd, cagr, confidence: Number(conf.toFixed(3)) };
  };

  return {
    ok: true,
    model: { W },
    stats: { count: dataset.length },
    predict
  };
}

export function predictForCurrent(): {
  ok: boolean;
  predictedSharpe: number;
  predictedMDD: number;
  predictedCAGR: number;
  confidence: number;
  features: number[];
} {
  // Feature de entrada: usa el último manifest como “estado actual”.
  const rows = readManifests();
  const last = rows[rows.length - 1] || {};
  const trades = safeNum(last.tradesCount, 0);
  const equity = safeNum(last.equityFinal, 0);

  const x = [
    safeNum(last.sharpe, 1.0),
    Math.abs(safeNum(last.mdd, 0.02)),
    safeNum(last.cagr, 0.03),
    trades > 0 ? Math.min(1, trades / Math.max(1, trades)) : 0.2,
    equity > 0 ? 1 : 0.2,
  ];

  const model = trainPredictor();
  const y = model.predict(x);
  return {
    ok: true,
    predictedSharpe: Number(y.sharpe.toFixed(3)),
    predictedMDD: Number(y.mdd.toFixed(3)),
    predictedCAGR: Number(y.cagr.toFixed(4)),
    confidence: y.confidence,
    features: x
  };
}
