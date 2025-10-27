export function maxDrawdown(eq:number[]){
  let peak=eq[0], mdd=0;
  for(const x of eq){ peak=Math.max(peak,x); mdd=Math.max(mdd,(peak-x)/peak); }
  return mdd;
}
export function returns(eq:number[]){
  const r:number[]=[]; for(let i=1;i<eq.length;i++) r.push(eq[i]/eq[i-1]-1); return r;
}
export function sharpe(r:number[], rf=0){
  if(r.length<2) return 0;
  const mean=r.reduce((a,b)=>a+b,0)/r.length - rf/252;
  const sd=Math.sqrt(r.reduce((a,b)=>a+(b-mean)**2,0)/(r.length-1));
  return sd ? (mean*Math.sqrt(252))/sd : 0;
}
export function sortino(r:number[], rf=0){
  const neg=r.filter(x=>x<0);
  const dd=Math.sqrt(neg.reduce((a,b)=>a+b*b,0)/(neg.length||1));
  const mean=r.reduce((a,b)=>a+b,0)/r.length - rf/252;
  return dd ? (mean*Math.sqrt(252))/dd : 0;
}
export function cagr(eq:number[], barsPerYear=252){
  const total=eq[eq.length-1]/eq[0];
  const years=eq.length/barsPerYear;
  return Math.pow(total,1/years)-1;
}
