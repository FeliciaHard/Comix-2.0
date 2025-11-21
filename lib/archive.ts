import JSZip from 'jszip';

export function loadArchiveFormats(formats: string[]) {
  // no-op or validation
  console.log('Supported formats:', formats.join(', '));
}

export type ArchiveEntry = {
  name: string;
  readData: (cb: (data: Uint8Array, err?: string) => void) => void;
};

export type Archive = {
  entries: ArchiveEntry[];
};

export function archiveOpenFile(file: File, callback: (archive?: Archive, err?: string) => void) {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'zip') {
    const zip = new JSZip();
    zip.loadAsync(file)
      .then(ziped => {
        const entries: ArchiveEntry[] = Object.values(ziped.files)
          .filter(f => !f.dir)
          .map(f => ({
            name: f.name,
            readData: (cb) => {
              f.async('uint8array')
                .then(data => cb(data))
                .catch(err => cb(new Uint8Array(), err.message));
            }
          }));
        callback({ entries });
      })
      .catch(err => callback(undefined, 'Failed to open zip: ' + err.message));
  } else {
    callback(undefined, `Unsupported archive format: .${ext}`);
  }
}
