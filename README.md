# Gutenberg Performance Optimizer

A WordPress plugin that enhances the performance of the Gutenberg editor, especially for pages with many blocks.

## Features

- **Block Virtualization**: Only renders blocks that are currently visible in the viewport
- **Block Caching**: Caches rendered blocks to improve performance
- **Lazy Loading**: Implements lazy loading for images and iframes
- **Optimized Rendering**: Uses batched rendering and debouncing to improve editor responsiveness
- **Configurable Settings**: Adjust optimization settings through the WordPress admin panel

## Installation

1. Download the plugin files
2. Upload the `gutenberg-performance-optimizer` folder to the `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Navigate to Settings > Gutenberg Performance Optimizer to configure the plugin

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository
2. Navigate to the plugin directory
3. Run `npm install` to install dependencies
4. Run `npm run build` to build the plugin
5. For development, use `npm run start` to start the development server

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run start
```

## Configuration

The plugin can be configured through the WordPress admin panel:

1. Go to Settings > Gutenberg Performance Optimizer
2. Configure the following options:
   - Enable/disable block caching
   - Enable/disable lazy loading
   - Set batch size for block rendering
   - Configure cache duration

## How It Works

### Block Virtualization

The plugin implements block virtualization, which means it only renders blocks that are currently visible in the viewport. This significantly reduces the number of DOM elements and improves performance.

### Block Caching

Blocks are cached after their first render, reducing the need to re-render them when they come into view again. The cache is automatically invalidated when block content changes.

### Lazy Loading

Images and iframes are loaded lazily, meaning they only load when they come into view. This reduces initial page load time and improves overall performance.

### Optimized Rendering

The plugin uses batched rendering and debouncing to prevent performance issues when making multiple changes to blocks. This ensures smooth editing experience even with many blocks.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This plugin is licensed under the GPL v2 or later.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository. 