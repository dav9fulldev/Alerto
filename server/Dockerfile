# Image de base ultra-legere
FROM python:3.10-slim

# Repertoire de travail
WORKDIR /app

# Installation des dependances systeme necessaires
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers de dependances
COPY requirements.txt .

# Installation des librairies Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie de tout le code source
COPY . .

# Creation du dossier uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposition du port
EXPOSE 8000

# Commande de lancement
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
