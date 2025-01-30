const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

// Test cases for different workload sizes
const TEST_CASES = [
    { name: 'Small', width: 800, height: 600, maxIter: 500 },
    { name: 'Medium', width: 1920, height: 1080, maxIter: 1000 },
    { name: 'Large', width: 3840, height: 2160, maxIter: 1500 },
    { name: 'Extra Large', width: 7680, height: 4320, maxIter: 2000 }
];

// Number of worker threads to use (defaults to number of CPU cores)
const NUM_WORKERS = os.cpus().length;

if (isMainThread) {
    async function calculateMandelbrotParallel(width, height, maxIter) {
        const result = new Uint8Array(width * height);
        const chunkSize = Math.ceil(height / NUM_WORKERS);
        const workers = [];
        
        // Create workers and distribute work
        for (let i = 0; i < NUM_WORKERS; i++) {
            const startY = i * chunkSize;
            const endY = Math.min(startY + chunkSize, height);
            
            const worker = new Worker(__filename, {
                workerData: { width, height, maxIter, startY, endY }
            });
            
            workers.push(
                new Promise((resolve) => {
                    worker.on('message', ({ startY, endY, chunk }) => {
                        result.set(chunk, startY * width);
                        resolve();
                    });
                })
            );
        }
        
        // Wait for all workers to complete
        await Promise.all(workers);
        return result;
    }

    // Run benchmarks
    async function runBenchmarks() {
        console.log('JavaScript Mandelbrot Calculator Benchmark (Parallel)');
        console.log('Size           Resolution    Iterations    Time (ms)     Pixels/ms');
        console.log('-'.repeat(75));

        for (const { name, width, height, maxIter } of TEST_CASES) {
            process.stdout.write(name.padEnd(15));
            process.stdout.write(`${width}x${height}`.padEnd(15));
            process.stdout.write(maxIter.toString().padEnd(15));

            const start = performance.now();
            const result = await calculateMandelbrotParallel(width, height, maxIter);
            const duration = performance.now() - start;

            const pixelsPerMs = (width * height) / duration;

            process.stdout.write(duration.toFixed(2).padEnd(15));
            console.log(Math.floor(pixelsPerMs).toString().padEnd(15));

            // Verify calculation by showing first few pixels
            if (result.length >= 10) {
                console.log('First few pixels:', Array.from(result.slice(0, 10)));
                console.log();
            }
        }
    }

    runBenchmarks().catch(console.error);
} else {
    // Worker thread code
    const { width, height, maxIter, startY, endY } = workerData;
    const chunk = new Uint8Array((endY - startY) * width);

    // Calculate assigned portion of the image
    for (let y = startY; y < endY; y++) {
        for (let x = 0; x < width; x++) {
            const x0 = (x / width) * 3.5 - 2.5;
            const y0 = (y / height) * 2.0 - 1.0;

            let xi = 0;
            let yi = 0;
            let iter = 0;

            while (iter < maxIter && (xi * xi + yi * yi) <= 4) {
                const tmp = xi * xi - yi * yi + x0;
                yi = 2 * xi * yi + y0;
                xi = tmp;
                iter++;
            }

            chunk[(y - startY) * width + x] = iter === maxIter ? 0 : iter % 255;
        }
    }

    // Send result back to main thread
    parentPort.postMessage({ startY, endY, chunk });
}