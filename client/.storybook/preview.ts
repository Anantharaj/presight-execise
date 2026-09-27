import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    options: {
      storySort: {
        order: [
          'Docs',
          ['Introduction', 'Architecture', 'Client Guide', 'Server & API', 'Contributing'],
          'UI',
          'Users',
          'Pages',
        ],
      },
    },
  },
};

export default preview;
