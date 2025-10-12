#!/bin/bash

echo "Iniciando Galletas App - Desarrollo"
echo "=================================="

echo ""
echo "Iniciando Backend (Puerto 4000)..."
npm run dev &
BACKEND_PID=$!

echo ""
echo "Esperando 3 segundos para que el backend se inicie..."
sleep 3

echo ""
echo "Iniciando Frontend (Puerto 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "=================================="
echo "Aplicación iniciada!"
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo "=================================="
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Esperar a que termine cualquiera de los procesos
wait

