// Registers the template fonts once per process. Files live in src/assets/fonts
// (copied from Google Fonts) so the PDF renders identically everywhere.
import path from 'node:path';
import { Font } from '@react-pdf/renderer';

let done = false;
const f = (file: string) => path.join(process.cwd(), 'src', 'assets', 'fonts', file);

export function registerFonts() {
  if (done) return;
  done = true;
  Font.register({
    family: 'OpenSans',
    fonts: [
      { src: f('OpenSans-Regular.woff'), fontWeight: 400 },
      { src: f('OpenSans-Medium.woff'), fontWeight: 500 },
      { src: f('OpenSans-Bold.woff'), fontWeight: 700 },
      { src: f('OpenSans-Italic.woff'), fontWeight: 400, fontStyle: 'italic' },
      { src: f('OpenSans-BoldItalic.woff'), fontWeight: 700, fontStyle: 'italic' },
    ],
  });
  Font.register({
    family: 'DMSans',
    fonts: [
      { src: f('DMSans-Regular.woff'), fontWeight: 400 },
      { src: f('DMSans-Medium.woff'), fontWeight: 500 },
      { src: f('DMSans-Bold.woff'), fontWeight: 700 },
    ],
  });
  Font.register({
    family: 'Montserrat',
    fonts: [
      { src: f('Montserrat-Regular.woff'), fontWeight: 400 },
      { src: f('Montserrat-Medium.woff'), fontWeight: 500 },
      { src: f('Montserrat-Bold.woff'), fontWeight: 700 },
    ],
  });
  Font.register({
    family: 'Cormorant',
    fonts: [
      { src: f('CormorantGaramond-Light.woff'), fontWeight: 300 },
      { src: f('CormorantGaramond-Regular.woff'), fontWeight: 400 },
      { src: f('CormorantGaramond-Bold.woff'), fontWeight: 700 },
    ],
  });
  // No hyphenation: the templates never split words.
  Font.registerHyphenationCallback((word) => [word]);
}
