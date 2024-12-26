import { Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';

@Injectable()
export class DropboxService {
  private readonly dropbox = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  });

  async uploadFile(filePath: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const fileName = require('path').basename(filePath);

    try {
      const response = await this.dropbox.filesUpload({
        path: `/${fileName}`,
        contents: fileContent,
      });

      const sharedLinkResponse =
        await this.dropbox.sharingCreateSharedLinkWithSettings({
          path: response.result.path_display,
        });

      return sharedLinkResponse.result.url.replace('?dl=0', '?dl=1');
    } catch (error) {
      console.error('Dropbox upload error:', error);
      throw new Error('Failed to upload to Dropbox');
    }
  }
}
