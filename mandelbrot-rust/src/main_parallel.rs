use std::time::Instant;
use rayon::prelude::*;

// Simple test cases for different workload sizes
struct TestCase {
    name: &'static str,
    width: usize,
    height: usize,
    max_iter: u32,
}

fn calculate_mandelbrot(width: usize, height: usize, max_iter: u32) -> Vec<u8> {
    let mut result = vec![0; width * height];
    
    // Parallel calculation using Rayon - processes chunks of rows in parallel
    result.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
        for (x, pixel) in row.iter_mut().enumerate() {
            let x0 = (x as f64 / width as f64) * 3.5 - 2.5;
            let y0 = (y as f64 / height as f64) * 2.0 - 1.0;
            
            let mut xi = 0.0;
            let mut yi = 0.0;
            let mut iter = 0;
            
            // Calculate mandelbrot set membership for this pixel
            while iter < max_iter && xi * xi + yi * yi <= 4.0 {
                let tmp = xi * xi - yi * yi + x0;
                yi = 2.0 * xi * yi + y0;
                xi = tmp;
                iter += 1;
            }
            
            *pixel = if iter == max_iter { 0 } else { (iter % 255) as u8 };
        }
    });
    
    result
}

fn main() {
    // Define test cases from small to extra large workloads
    let test_cases = vec![
        TestCase { name: "Small", width: 800, height: 600, max_iter: 500 },
        TestCase { name: "Medium", width: 1920, height: 1080, max_iter: 1000 },
        TestCase { name: "Large", width: 3840, height: 2160, max_iter: 1500 },
        TestCase { name: "Extra Large", width: 7680, height: 4320, max_iter: 2000 },
    ];

    println!("Rust Mandelbrot Calculator Benchmark (Parallel)");
    println!("{:<15} {:<15} {:<15} {:<15} {:<15}", "Size", "Resolution", "Iterations", "Time (ms)", "Pixels/ms");
    println!("{}", "-".repeat(75));

    // Run benchmark for each test case
    for case in test_cases {
        print!("{:<15}", case.name);
        print!("{:>4}x{:<10}", case.width, case.height);
        print!("{:<15}", case.max_iter);
        
        let start = Instant::now();
        let result = calculate_mandelbrot(case.width, case.height, case.max_iter);
        let duration = start.elapsed();
        
        let ms = duration.as_secs_f64() * 1000.0;
        let pixels_per_ms = (case.width * case.height) as f64 / ms;
        
        print!("{:<15.2}", ms);
        println!("{:<15.0}", pixels_per_ms);
        
        // Verify calculation by showing first few pixels
        if result.len() >= 10 {
            println!("First few pixels: {:?}\n", &result[..10]);
        }
    }
}