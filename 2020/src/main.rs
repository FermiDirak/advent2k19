use std::env;

mod day01;
mod day02;
mod day03;
mod day04;
mod day05;
mod day06;
mod day07;
mod day08;
mod day09;

fn main() {
    let args: Vec<String> = env::args().collect();
    let day = &args[1].parse::<usize>().unwrap();

    match day {
        1 => {
            println!("Day01 p1: {:?}", day01::part_one());
            println!("Day01 p2: {:?}", day01::part_two());
        }
        2 => {
            println!("Day02 p1: {:?}", day02::part_one());
            println!("Day02 p2: {:?}", day02::part_two());
        }
        3 => {
            println!("Day03 p1: {:?}", day03::part_one());
            println!("Day03 p2: {:?}", day03::part_two());
        }
        4 => {
            println!("Day04 p1: {:?}", day04::part_one());
            println!("Day04 p2: {:?}", day04::part_two());
        }
        5 => {
            println!("Day05 p1: {:?}", day05::part_one());
            println!("Day05 p2: {:?}", day05::part_two());
        }
        6 => {
            println!("Day06 p1: {:?}", day06::part_one());
            println!("Day06 p2: {:?}", day06::part_two());
        }
        7 => {
            println!("Day07 p1: {:?}", day07::part_one());
            println!("Day07 p2: {:?}", day07::part_two());
        }
        8 => {
            println!("Day08 p1: {:?}", day08::part_one());
            println!("Day08 p2: {:?}", day08::part_two());
        }
        9 => {
            println!("Day09 p1: {:?}", day09::part_one());
            println!("Day09 p2: {:?}", day09::part_two());
        }
        _ => println!("Not a valid date."),
    }
}
