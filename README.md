# Mandelbrot Performance Benchmark

This project compares the performance of Rust and JavaScript implementations of the Mandelbrot set calculation across different workload sizes.

## Benchmark Categories

1. **Small**
   - Resolution: 800x600
   - Max iterations: 500
   - Total pixels: 480,000

2. **Medium**
   - Resolution: 1920x1080
   - Max iterations: 1000
   - Total pixels: 2,073,600

3. **Large**
   - Resolution: 3840x2160 (4K)
   - Max iterations: 1500
   - Total pixels: 8,294,400

4. **Extra Large**
   - Resolution: 7680x4320 (8K)
   - Max iterations: 2000
   - Total pixels: 33,177,600

## Running the Benchmarks

### Rust Implementation
```bash
cd mandelbrot-rust
cargo run --release
```

### JavaScript Implementation
```bash
cd mandelbrot-js
node mandelbrot.js
```

## Metrics Collected
- Execution time in milliseconds
- Pixels processed per millisecond
- Output verification (first 10 pixels)