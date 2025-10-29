#!/usr/bin/env bash
echo "🔧 Instalando dependencias incluyendo dev..."
npm install --include=dev
echo "🧠 Compilando proyecto con tsconfig.render.json..."
npm run build
