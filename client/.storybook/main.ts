import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/docs/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      // GitHub-flavored Markdown (tables, task lists) in MDX docs.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
};

export default config;
