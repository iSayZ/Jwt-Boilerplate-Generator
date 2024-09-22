import { Controller, Post, Body, Res } from '@nestjs/common';
import { GenerateService } from './generate.service.js';
import { Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

@Controller('api/generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post()
  async generateProject(@Body() options: any) {
    const { typescript, jwt, crud } = options;
    const project = await this.generateService.generateBoilerplate(typescript, jwt, crud);
    return { message: 'Boilerplate généré avec succès !' };
  }

  @Post('download')
  async downloadProject(@Res() res: Response) {
    // Convert import.meta.url en équivalent de __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const basePath = path.join(__dirname, '..', 'generate', 'generated-project'); // Dossier du projet généré
    console.log(basePath)
    const zipPath = await this.generateService.compressProject(basePath); // Appelle la fonction pour compresser le projet
    this.generateService.deleteDirectory(basePath);

    // Envoie du fichier zip au client
    res.download(zipPath, 'generated-project.zip', (err) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du fichier :', err);
        res.status(500).send('Erreur lors de l\'envoi du fichier');
      } else {
        // Supprime le fichier zip après l'envoi si nécessaire
        fs.unlinkSync(zipPath);
        console.log('Fichier zip envoyé et supprimé.');
      }
    });

  }
}
