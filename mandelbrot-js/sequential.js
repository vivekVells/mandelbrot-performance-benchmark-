// Test cases for different workload sizes
const TEST_CASES = [
    { name: 'Small', width: 800, height: 600, maxIter: 500 },
    { name: 'Medium', width: 1920, height: 1080, maxIter: 1000 },
    { name: 'Large', width: 3840, height: 2160, maxIter: 1500 },
    { name: 'Extra Large', width: 7680, height: 4320, maxIter: 2000 }
];

function calculateMandelbrot(width, height, maxIter) {
    const result = new Uint8Array(width * height);

    // Sequential calculation - one pixel at a time
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const x0 = (x / width) * 3.5 - 2.5;
            const y0 = (y / height) * 2.0 - 1.0;

            let xi = 0;
            let yi = 0;
            let iter = 0;

            // Calculate mandelbrot set membership for this pixel
            while (iter < maxIter && (xi * xi + yi * yi) <= 4) {
                const tmp = xi * xi - yi * yi + x0;
                yi = 2 * xi * yi + y0;
                xi = tmp;
                iter++;
            }

            result[y * width + x] = iter === maxIter ? 0 : iter % 255;
        }
    }

    return result;
}

// Run benchmarks
console.log('JavaScript Mandelbrot Calculator Benchmark (Sequential)');
console.log('Size           Resolution    Iterations    Time (ms)     Pixels/ms');
console.log('-'.repeat(75));

TEST_CASES.forEach(({ name, width, height, maxIter }) => {
    process.stdout.write(name.padEnd(15));
    process.stdout.write(`${width}x${height}`.padEnd(15));
    process.stdout.write(maxIter.toString().padEnd(15));

    const start = performance.now();
    const result = calculateMandelbrot(width, height, maxIter);
    const duration = performance.now() - start;

    const pixelsPerMs = (width * height) / duration;

    process.stdout.write(duration.toFixed(2).padEnd(15));
    console.log(Math.floor(pixelsPerMs).toString().padEnd(15));

    // Verify calculation by showing first few pixels
    if (result.length >= 10) {
        console.log('First few pixels:', Array.from(result.slice(0, 10)));
        console.log();
    }
});