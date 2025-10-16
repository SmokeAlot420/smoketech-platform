import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentGrid } from '../content-grid';
import { toast } from '@/hooks/use-toast';

// Mock the hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  }),
  toast: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.open
global.open = jest.fn();

describe('ContentGrid Component', () => {
  const mockImages = [
    { url: 'https://example.com/image1.jpg', prompt: 'Test prompt 1' },
    { url: 'https://example.com/image2.jpg', prompt: 'Test prompt 2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the content grid with tabs', () => {
      render(<ContentGrid />);

      expect(screen.getByText('Generated Content')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Images/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Videos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Omega Workflow/i })).toBeInTheDocument();
    });

    it('should display empty state when no content', () => {
      render(<ContentGrid />);

      expect(screen.getByText(/No images generated yet/i)).toBeInTheDocument();
    });

    it('should load content from localStorage on mount', () => {
      localStorage.setItem('generatedImages', JSON.stringify(mockImages));

      render(<ContentGrid />);

      expect(screen.getByAltText('Generated 1')).toBeInTheDocument();
      expect(screen.getByAltText('Generated 2')).toBeInTheDocument();
    });
  });

  describe('Image Generation', () => {
    it('should handle successful image generation', async () => {
      const mockResponse = {
        success: true,
        images: [
          { url: 'https://example.com/new-image.jpg', mimeType: 'image/jpeg' }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<ContentGrid />);

      // Switch to Images tab
      const imagesTab = screen.getByRole('tab', { name: /Images/i });
      fireEvent.click(imagesTab);

      // Enter prompt
      const promptInput = screen.getByPlaceholderText(/describe the image/i);
      await userEvent.type(promptInput, 'A beautiful sunset');

      // Click generate button
      const generateButton = screen.getByRole('button', { name: /Generate Images/i });
      fireEvent.click(generateButton);

      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByAltText('Generated 1')).toBeInTheDocument();
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          variant: 'success'
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      });

      render(<ContentGrid />);

      const imagesTab = screen.getByRole('tab', { name: /Images/i });
      fireEvent.click(imagesTab);

      const promptInput = screen.getByPlaceholderText(/describe the image/i);
      await userEvent.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /Generate Images/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive'
          })
        );
      });
    });

    it('should validate required fields', async () => {
      render(<ContentGrid />);

      const imagesTab = screen.getByRole('tab', { name: /Images/i });
      fireEvent.click(imagesTab);

      // Try to generate without prompt
      const generateButton = screen.getByRole('button', { name: /Generate Images/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('enter a prompt'),
            variant: 'destructive'
          })
        );
      });
    });

    it('should handle model selection', async () => {
      render(<ContentGrid />);

      const imagesTab = screen.getByRole('tab', { name: /Images/i });
      fireEvent.click(imagesTab);

      // Select different model
      const modelSelect = screen.getByRole('combobox', { name: /Model/i });
      fireEvent.change(modelSelect, { target: { value: 'nanobana' } });

      expect(modelSelect).toHaveValue('nanobana');
    });
  });

  describe('Video Generation', () => {
    it('should handle video generation request', async () => {
      const mockResponse = {
        success: true,
        video: { url: 'https://example.com/video.mp4' }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<ContentGrid />);

      const videosTab = screen.getByRole('tab', { name: /Videos/i });
      fireEvent.click(videosTab);

      const promptInput = screen.getByPlaceholderText(/describe the video/i);
      await userEvent.type(promptInput, 'A flying bird');

      const generateButton = screen.getByRole('button', { name: /Generate Video/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });
    });

    it('should upload reference image for video', async () => {
      render(<ContentGrid />);

      const videosTab = screen.getByRole('tab', { name: /Videos/i });
      fireEvent.click(videosTab);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/Upload Reference Image/i);

      await userEvent.upload(input, file);

      expect(input).toHaveProperty('files[0]', file);
    });
  });

  describe('Omega Workflow', () => {
    it('should initiate omega workflow', async () => {
      const mockResponse = {
        success: true,
        operationId: 'op-123',
        estimatedTime: 300
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<ContentGrid />);

      const omegaTab = screen.getByRole('tab', { name: /Omega Workflow/i });
      fireEvent.click(omegaTab);

      // Select character
      const characterSelect = screen.getByRole('combobox', { name: /Character/i });
      fireEvent.change(characterSelect, { target: { value: 'Aria' } });

      // Enter prompt
      const promptInput = screen.getByPlaceholderText(/video concept/i);
      await userEvent.type(promptInput, 'Insurance tips');

      // Set duration
      const durationInput = screen.getByLabelText(/Duration/i);
      await userEvent.clear(durationInput);
      await userEvent.type(durationInput, '30');

      // Start workflow
      const startButton = screen.getByRole('button', { name: /Start Omega Workflow/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/Operation ID: op-123/i)).toBeInTheDocument();
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Workflow Started',
          variant: 'success'
        })
      );
    });

    it('should validate omega workflow inputs', async () => {
      render(<ContentGrid />);

      const omegaTab = screen.getByRole('tab', { name: /Omega Workflow/i });
      fireEvent.click(omegaTab);

      // Try to start without required fields
      const startButton = screen.getByRole('button', { name: /Start Omega Workflow/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('required'),
            variant: 'destructive'
          })
        );
      });
    });
  });

  describe('Content Actions', () => {
    it('should delete content item', async () => {
      localStorage.setItem('generatedImages', JSON.stringify(mockImages));

      render(<ContentGrid />);

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByAltText('Generated 1')).not.toBeInTheDocument();
      });
    });

    it('should download content', () => {
      localStorage.setItem('generatedImages', JSON.stringify(mockImages));

      render(<ContentGrid />);

      const downloadButtons = screen.getAllByRole('button', { name: /Download/i });
      fireEvent.click(downloadButtons[0]);

      expect(global.open).toHaveBeenCalledWith(mockImages[0].url, '_blank');
    });

    it('should copy prompt to clipboard', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      });

      localStorage.setItem('generatedImages', JSON.stringify(mockImages));

      render(<ContentGrid />);

      const copyButtons = screen.getAllByRole('button', { name: /Copy Prompt/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockImages[0].prompt);
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Copied',
          variant: 'success'
        })
      );
    });
  });

  describe('Loading States', () => {
    it('should show loading state during generation', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<ContentGrid />);

      const imagesTab = screen.getByRole('tab', { name: /Images/i });
      fireEvent.click(imagesTab);

      const promptInput = screen.getByPlaceholderText(/describe the image/i);
      await userEvent.type(promptInput, 'Test');

      const generateButton = screen.getByRole('button', { name: /Generate Images/i });
      fireEvent.click(generateButton);

      expect(screen.getByText(/Generating/i)).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Error Boundary', () => {
    it('should catch and display errors gracefully', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { container } = render(
        <ContentGrid>
          <ThrowError />
        </ContentGrid>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});