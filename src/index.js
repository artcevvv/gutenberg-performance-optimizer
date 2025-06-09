import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { select, subscribe } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

// Block virtualization implementation
const withBlockVirtualization = createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
        const { clientId } = props;
        const { getBlockIndex, getBlockCount } = select('core/block-editor');
        const blockIndex = getBlockIndex(clientId);
        const totalBlocks = getBlockCount();
        
        // Only render blocks that are within the viewport
        const isVisible = isBlockInViewport(blockIndex, totalBlocks);
        
        if (!isVisible) {
            return null;
        }
        
        return <BlockListBlock {...props} />;
    };
}, 'withBlockVirtualization');

// Add block virtualization to all blocks
addFilter(
    'editor.BlockListBlock',
    'gutenberg-performance-optimizer/with-block-virtualization',
    withBlockVirtualization
);

// Block rendering optimization
const optimizeBlockRendering = () => {
    let renderQueue = [];
    let isProcessing = false;
    const batchSize = gpoSettings.batchSize || 10;

    const processQueue = () => {
        if (isProcessing || renderQueue.length === 0) return;
        
        isProcessing = true;
        const batch = renderQueue.splice(0, batchSize);
        
        batch.forEach(({ block, resolve }) => {
            // Process block rendering
            resolve(block);
        });
        
        isProcessing = false;
        
        if (renderQueue.length > 0) {
            requestAnimationFrame(processQueue);
        }
    };

    return {
        queueBlock: (block) => {
            return new Promise((resolve) => {
                renderQueue.push({ block, resolve });
                processQueue();
            });
        }
    };
};

const blockRenderer = optimizeBlockRendering();

// Block caching implementation
const blockCache = new Map();

const withBlockCaching = createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
        const { clientId, attributes } = props;
        const cacheKey = `${clientId}-${JSON.stringify(attributes)}`;
        
        if (gpoSettings.cacheEnabled && blockCache.has(cacheKey)) {
            return blockCache.get(cacheKey);
        }
        
        const renderedBlock = <BlockListBlock {...props} />;
        
        if (gpoSettings.cacheEnabled) {
            blockCache.set(cacheKey, renderedBlock);
        }
        
        return renderedBlock;
    };
}, 'withBlockCaching');

// Add block caching to all blocks
addFilter(
    'editor.BlockListBlock',
    'gutenberg-performance-optimizer/with-block-caching',
    withBlockCaching
);

// Helper function to determine if a block should be visible
function isBlockInViewport(blockIndex, totalBlocks) {
    const viewportHeight = window.innerHeight;
    const blockHeight = 100; // Approximate block height
    const scrollTop = window.scrollY;
    const blockTop = blockIndex * blockHeight;
    const blockBottom = blockTop + blockHeight;
    
    return (
        (blockTop >= scrollTop && blockTop <= scrollTop + viewportHeight) ||
        (blockBottom >= scrollTop && blockBottom <= scrollTop + viewportHeight)
    );
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize editor performance
const optimizeEditor = () => {
    // Debounce block updates
    const debouncedBlockUpdate = debounce(() => {
        // Force a re-render of visible blocks
        const { getBlockCount } = select('core/block-editor');
        const totalBlocks = getBlockCount();
        
        for (let i = 0; i < totalBlocks; i++) {
            if (isBlockInViewport(i, totalBlocks)) {
                // Trigger block update
                const { updateBlockAttributes } = dispatch('core/block-editor');
                updateBlockAttributes(i, { _optimized: Date.now() });
            }
        }
    }, 150);

    // Subscribe to block changes
    subscribe(() => {
        debouncedBlockUpdate();
    });
};

// Initialize optimizations
document.addEventListener('DOMContentLoaded', () => {
    optimizeEditor();
}); 