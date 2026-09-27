import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Button } from '../Button';
import { Drawer } from './Drawer';

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: {
    open: false,
    onClose: fn(),
    title: 'Filters',
    children: <p className="p-4 text-sm text-slate-600">Drawer content goes here.</p>,
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <Button variant="primary" className="w-full justify-center" onClick={() => setOpen(false)}>
              Show results
            </Button>
          }
        />
      </>
    );
  },
};
