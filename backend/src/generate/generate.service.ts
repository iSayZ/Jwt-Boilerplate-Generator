import { Injectable } from '@nestjs/common';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

@Injectable()
export class GenerateService {
  async generateBoilerplate(typescript: boolean, jwt: boolean, crud: boolean) {

    console.log('Début de la génération du boilerplate');  // Log pour vérifier si cette méthode est appelée

    const basePath = await this.getAvailableBasePath('generated-project');
    
    // Vérifier le chemin de base
    console.log(`Chemin de base pour le projet généré: ${basePath}`);

    // 1. Créer la structure du répertoire
    try {
      fs.mkdirSync(basePath, { recursive: true });
      console.log('Répertoire de base créé');

      fs.mkdirSync(path.join(basePath, 'frontend'), { recursive: true });
      fs.mkdirSync(path.join(basePath, 'backend'), { recursive: true });
      fs.mkdirSync(path.join(basePath, 'tests'), { recursive: true });
      console.log('Structure du répertoire créée');
    } catch (error) {
      console.error('Erreur lors de la création de la structure des répertoires', error);
      throw new Error('Erreur lors de la création de la structure des répertoires');
    }
    
    // 2. Générer la partie frontend
    try {
      await this.generateFrontend(typescript, basePath);
      console.log('Génération du frontend terminée');
    } catch (error) {
      console.error('Erreur lors de la génération du frontend', error);
    }

    // Ici, nous ajouterons les étapes suivantes (backend, Docker, etc.)

    console.log(`Projet généré avec TypeScript: ${typescript}, JWT: ${jwt}, CRUD: ${crud}`);
  }

  private async getAvailableBasePath(baseName: string): Promise<string> {
    
    // Convert import.meta.url en équivalent de __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    let index = 0;
    let basePath: string;
    
    do {
      index++;
      basePath = path.join(__dirname, `${baseName}${index === 1 ? '' : index}`);
    } while (fs.existsSync(basePath));
    
    return basePath;
  }
  
  private async generateFrontend(typescript: boolean, basePath: string) {
    console.log('Début de la génération du frontend');  // Log pour vérifier si la méthode est appelée

    const frontendPath = path.join(basePath, 'frontend');
    console.log('frontpath', frontendPath)
    const template = typescript ? 'react-ts' : 'react';
    const cmd = `npm create vite@latest frontend -- --template ${template}`;
    
    console.log(`Commande exécutée : ${cmd}`);

    try {
      const { stdout } = await execa(cmd, {
        cwd: basePath,  // Spécifie le répertoire cible
        shell: true,  // Nécessaire pour certaines commandes dans certains environnements
      });
      console.log('Sortie de la commande :', stdout);
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande Vite :', error.message);
      console.error('Détails de l\'erreur :', error.stderr); // Détails de la sortie d'erreur
      throw new Error('Échec de la génération du boilerplate.');
    }
    
    

    // Installation des dépendances supplémentaires
    try {
      console.log('Installation des dépendances frontend...');
      const { stdout } = await execa('npm install axios react-router-dom', {
        cwd: frontendPath,  // Spécifie le répertoire cible
        shell: true,  // Nécessaire pour certaines commandes dans certains environnements
      });
      console.log('Sortie de la commande :', stdout);
      console.log('Dépendances installées');
    } catch (error) {
      console.error('Erreur lors de l\'installation des dépendances frontend', error);
      throw new Error('Échec de l\'installation des dépendances frontend');
    }

    // Ajout du fichier de service d'authentification
    try {
      const authServiceContent = `
        import axios from 'axios';
        
        const API_URL = '/api/auth/';
        
        export const login = async (username, password) => {
          const response = await axios.post(API_URL + 'login', { username, password });
          return response.data;
        };
      `;

      fs.mkdirSync(`${frontendPath}/src/services`, { recursive: true });
      fs.writeFileSync(path.join(frontendPath, 'src', 'services', 'authService.js'), authServiceContent);

      console.log('Fichier authService.js généré');
    } catch (error) {
      console.error('Erreur lors de la génération du fichier authService.js', error);
      throw new Error('Erreur lors de la génération du fichier authService.js');
    }
  }

  async compressProject(basePath: string): Promise<string> {
    const outputPath = path.join(basePath, '..', 'generated-project.zip'); // Chemin vers le fichier .zip
    const output = fs.createWriteStream(outputPath); // Crée un flux d'écriture pour le fichier zip

    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Compression maximale
      });

      output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log('Le fichier zip a été créé avec succès.');
        resolve(outputPath);
      });

      archive.on('error', (err) => {
        console.error('Erreur lors de la compression :', err);
        reject(err);
      });

      archive.pipe(output); // Envoie les données compressées vers le fichier .zip

      // Ajoute tous les fichiers du dossier de projet au fichier .zip
      archive.directory(basePath, false);

      archive.finalize(); // Termine la compression
    });
  }

  async deleteDirectory(basePath: string) {
    try {
      fs.rmSync(basePath, { recursive: true, force: true }); // Supprime le dossier et son contenu
      console.log(`Dossier supprimé : ${basePath}`);
    } catch (err) {
      console.error(`Erreur lors de la suppression : ${err}`);
    }
  };

}
