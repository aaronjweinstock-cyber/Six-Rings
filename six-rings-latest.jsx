import { useState, useRef, useEffect } from "react";

// ============ DATA ============
// pos: eligible slots. pick: real (best-effort historical) draft slot — no two
// drafted players can share a pick number, even across different years.
// floor: for unproven/young players (2019+ classes), the low end of a random
// development roll each run. Established veterans have a fixed known career (no floor).
// Every class is guaranteed 3+ center-eligible players so a pick collision can
// never zero out a position.
const DRAFT_CLASSES = [
  { year: 1969, players: [
    { name: "Kareem Abdul-Jabbar", pick: 1, pos: ["C"], scoring: 95, playmaking: 70, rebounding: 92, defense: 90, ovr: 99 },
    { name: "Neal Walk", pick: 2, pos: ["C"], scoring: 72, playmaking: 45, rebounding: 80, defense: 62, ovr: 74 },
    { name: "Lucius Allen", pick: 3, pos: ["G"], scoring: 76, playmaking: 72, rebounding: 42, defense: 66, ovr: 74 },
    { name: "Butch Beard", pick: 4, pos: ["G"], scoring: 72, playmaking: 72, rebounding: 48, defense: 68, ovr: 73 },
    { name: "Terry Driscoll", pick: 5, pos: ["F"], scoring: 58, playmaking: 40, rebounding: 62, defense: 58, ovr: 62 },
    { name: "Dick Garrett", pick: 6, pos: ["G"], scoring: 66, playmaking: 52, rebounding: 42, defense: 58, ovr: 64 },
    { name: "Bob Presley", pick: 7, pos: ["C"], scoring: 48, playmaking: 30, rebounding: 64, defense: 60, ovr: 58 },
    { name: "Herm Gilliam", pick: 8, pos: ["G"], scoring: 73, playmaking: 58, rebounding: 45, defense: 62, ovr: 70 },
    { name: "Jo Jo White", pick: 9, pos: ["G"], scoring: 80, playmaking: 78, rebounding: 45, defense: 72, ovr: 84 },
    { name: "Mike Davis", pick: 10, pos: ["G"], scoring: 68, playmaking: 45, rebounding: 42, defense: 50, ovr: 62 },
    { name: "Rick Roberson", pick: 12, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 76, defense: 66, ovr: 67 },
    { name: "Bob Portman", pick: 17, pos: ["F"], scoring: 60, playmaking: 40, rebounding: 62, defense: 55, ovr: 64 },
    { name: "Norm Van Lier", pick: 34, pos: ["G"], scoring: 70, playmaking: 80, rebounding: 48, defense: 85, ovr: 79 },
    { name: "Bob Dandridge", pick: 45, pos: ["F"], scoring: 80, playmaking: 58, rebounding: 70, defense: 76, ovr: 82 },
  ]},
  { year: 1970, players: [
    { name: "Bob Lanier", pick: 1, pos: ["C"], scoring: 85, playmaking: 50, rebounding: 88, defense: 82, ovr: 92 },
    { name: "Rudy Tomjanovich", pick: 2, pos: ["F"], scoring: 82, playmaking: 48, rebounding: 72, defense: 60, ovr: 80 },
    { name: "Pete Maravich", pick: 3, pos: ["G"], scoring: 92, playmaking: 85, rebounding: 45, defense: 55, ovr: 90 },
    { name: "Dave Cowens", pick: 4, pos: ["C"], scoring: 82, playmaking: 55, rebounding: 90, defense: 85, ovr: 90 },
    { name: "Sam Lacey", pick: 5, pos: ["C"], scoring: 62, playmaking: 45, rebounding: 80, defense: 72, ovr: 72 },
    { name: "John Johnson", pick: 7, pos: ["F"], scoring: 72, playmaking: 58, rebounding: 62, defense: 60, ovr: 72 },
    { name: "Geoff Petrie", pick: 8, pos: ["G"], scoring: 82, playmaking: 65, rebounding: 42, defense: 58, ovr: 80 },
    { name: "Pete Cross", pick: 9, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 72, defense: 62, ovr: 62 },
    { name: "Jim McMillian", pick: 13, pos: ["F"], scoring: 76, playmaking: 52, rebounding: 55, defense: 58, ovr: 74 },
    { name: "Dave Sorenson", pick: 15, pos: ["F"], scoring: 62, playmaking: 40, rebounding: 62, defense: 55, ovr: 62 },
    { name: "Mike Maloy", pick: 17, pos: ["F"], scoring: 55, playmaking: 38, rebounding: 60, defense: 56, ovr: 60 },
    { name: "Calvin Murphy", pick: 18, pos: ["G"], scoring: 85, playmaking: 72, rebounding: 35, defense: 60, ovr: 82 },
    { name: "Nate Archibald", pick: 19, pos: ["G"], scoring: 88, playmaking: 90, rebounding: 40, defense: 58, ovr: 88 },
    { name: "Jake Ford", pick: 21, pos: ["G"], scoring: 60, playmaking: 50, rebounding: 38, defense: 52, ovr: 60 },
    { name: "Garfield Heard", pick: 26, pos: ["F"], scoring: 62, playmaking: 40, rebounding: 70, defense: 68, ovr: 68 },
  ]},
  { year: 1971, players: [
    { name: "Austin Carr", pick: 1, pos: ["G"], scoring: 82, playmaking: 60, rebounding: 45, defense: 58, ovr: 80 },
    { name: "Sidney Wicks", pick: 2, pos: ["F"], scoring: 80, playmaking: 55, rebounding: 78, defense: 62, ovr: 80 },
    { name: "Elmore Smith", pick: 3, pos: ["C"], scoring: 62, playmaking: 35, rebounding: 84, defense: 80, ovr: 74 },
    { name: "Ken Durrett", pick: 4, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 62, defense: 55, ovr: 66 },
    { name: "Fred Brown", pick: 6, pos: ["G"], scoring: 80, playmaking: 60, rebounding: 42, defense: 58, ovr: 76 },
    { name: "Howard Porter", pick: 8, pos: ["F"], scoring: 66, playmaking: 42, rebounding: 66, defense: 58, ovr: 66 },
    { name: "Clifford Ray", pick: 10, pos: ["C"], scoring: 52, playmaking: 38, rebounding: 78, defense: 78, ovr: 70 },
    { name: "Curtis Rowe", pick: 11, pos: ["F"], scoring: 68, playmaking: 45, rebounding: 70, defense: 60, ovr: 70 },
    { name: "Steve Patterson", pick: 13, pos: ["C"], scoring: 48, playmaking: 30, rebounding: 68, defense: 60, ovr: 62 },
    { name: "Charlie Yelverton", pick: 25, pos: ["G"], scoring: 58, playmaking: 48, rebounding: 40, defense: 52, ovr: 58 },
    { name: "John Mengelt", pick: 26, pos: ["G"], scoring: 68, playmaking: 55, rebounding: 35, defense: 55, ovr: 66 },
    { name: "Willie Sojourner", pick: 27, pos: ["C"], scoring: 50, playmaking: 30, rebounding: 66, defense: 62, ovr: 58 },
    { name: "Phil Chenier", pick: 50, pos: ["G"], scoring: 80, playmaking: 62, rebounding: 45, defense: 68, ovr: 78 },
    { name: "Randy Smith", pick: 104, pos: ["G"], scoring: 80, playmaking: 68, rebounding: 45, defense: 68, ovr: 78 },
  ]},
  { year: 1972, players: [
    { name: "LaRue Martin", pick: 1, pos: ["C"], scoring: 45, playmaking: 30, rebounding: 62, defense: 58, ovr: 58 },
    { name: "Bob McAdoo", pick: 2, pos: ["C"], scoring: 90, playmaking: 50, rebounding: 85, defense: 72, ovr: 90 },
    { name: "Corky Calhoun", pick: 4, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 58, defense: 62, ovr: 62 },
    { name: "Dwight Davis", pick: 5, pos: ["F", "C"], scoring: 60, playmaking: 40, rebounding: 68, defense: 60, ovr: 64 },
    { name: "Bud Stallworth", pick: 7, pos: ["G", "F"], scoring: 62, playmaking: 42, rebounding: 45, defense: 52, ovr: 62 },
    { name: "Bob Nash", pick: 8, pos: ["F"], scoring: 60, playmaking: 42, rebounding: 62, defense: 58, ovr: 62 },
    { name: "Paul Westphal", pick: 10, pos: ["G"], scoring: 85, playmaking: 72, rebounding: 42, defense: 65, ovr: 84 },
    { name: "Fred Boyd", pick: 11, pos: ["G"], scoring: 66, playmaking: 60, rebounding: 40, defense: 55, ovr: 66 },
    { name: "Julius Erving", pick: 12, pos: ["F"], scoring: 93, playmaking: 68, rebounding: 80, defense: 75, ovr: 96 },
    { name: "Mel Davis", pick: 13, pos: ["F"], scoring: 58, playmaking: 38, rebounding: 64, defense: 55, ovr: 60 },
    { name: "Jim Price", pick: 25, pos: ["G"], scoring: 72, playmaking: 62, rebounding: 40, defense: 62, ovr: 70 },
    { name: "Kevin Porter", pick: 30, pos: ["G"], scoring: 72, playmaking: 85, rebounding: 38, defense: 60, ovr: 76 },
    { name: "Lloyd Neal", pick: 32, pos: ["F"], scoring: 62, playmaking: 42, rebounding: 72, defense: 66, ovr: 68 },
  ]},
  { year: 1973, players: [
    { name: "Doug Collins", pick: 1, pos: ["G"], scoring: 82, playmaking: 60, rebounding: 42, defense: 60, ovr: 80 },
    { name: "Ernie DiGregorio", pick: 3, pos: ["G"], scoring: 74, playmaking: 85, rebounding: 35, defense: 50, ovr: 76 },
    { name: "Kermit Washington", pick: 5, pos: ["F"], scoring: 62, playmaking: 42, rebounding: 80, defense: 72, ovr: 72 },
    { name: "Ron Behagen", pick: 6, pos: ["F", "C"], scoring: 62, playmaking: 40, rebounding: 68, defense: 58, ovr: 64 },
    { name: "Barry Parkhill", pick: 7, pos: ["G"], scoring: 58, playmaking: 50, rebounding: 38, defense: 50, ovr: 58 },
    { name: "Mike Bantom", pick: 8, pos: ["F"], scoring: 68, playmaking: 45, rebounding: 68, defense: 62, ovr: 68 },
    { name: "Mike Green", pick: 9, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 68, defense: 66, ovr: 62 },
    { name: "John Brown", pick: 10, pos: ["F"], scoring: 60, playmaking: 42, rebounding: 60, defense: 55, ovr: 62 },
    { name: "Kevin Kunnert", pick: 12, pos: ["C"], scoring: 52, playmaking: 35, rebounding: 76, defense: 66, ovr: 64 },
    { name: "Nick Weatherspoon", pick: 13, pos: ["F"], scoring: 66, playmaking: 42, rebounding: 62, defense: 55, ovr: 66 },
    { name: "Swen Nater", pick: 16, pos: ["C"], scoring: 60, playmaking: 38, rebounding: 84, defense: 66, ovr: 72 },
    { name: "George McGinnis", pick: 22, pos: ["F"], scoring: 86, playmaking: 60, rebounding: 80, defense: 68, ovr: 86 },
    { name: "Allan Bristow", pick: 25, pos: ["F"], scoring: 66, playmaking: 52, rebounding: 58, defense: 55, ovr: 66 },
    { name: "Kevin Stacom", pick: 26, pos: ["G"], scoring: 62, playmaking: 52, rebounding: 40, defense: 55, ovr: 62 },
  ]},
  { year: 1974, players: [
    { name: "Bill Walton", pick: 1, pos: ["C"], scoring: 82, playmaking: 68, rebounding: 88, defense: 90, ovr: 92 },
    { name: "Marvin Barnes", pick: 2, pos: ["F", "C"], scoring: 80, playmaking: 45, rebounding: 80, defense: 62, ovr: 80 },
    { name: "Tom Burleson", pick: 3, pos: ["C"], scoring: 60, playmaking: 35, rebounding: 74, defense: 70, ovr: 66 },
    { name: "John Shumate", pick: 4, pos: ["F", "C"], scoring: 68, playmaking: 45, rebounding: 68, defense: 60, ovr: 68 },
    { name: "Scott Wedman", pick: 6, pos: ["F"], scoring: 76, playmaking: 48, rebounding: 60, defense: 62, ovr: 74 },
    { name: "Campy Russell", pick: 8, pos: ["F"], scoring: 76, playmaking: 48, rebounding: 58, defense: 55, ovr: 72 },
    { name: "Tom McMillen", pick: 9, pos: ["F"], scoring: 66, playmaking: 42, rebounding: 60, defense: 55, ovr: 64 },
    { name: "Jamaal Wilkes", pick: 11, pos: ["F"], scoring: 82, playmaking: 55, rebounding: 68, defense: 68, ovr: 82 },
    { name: "Brian Winters", pick: 12, pos: ["G"], scoring: 78, playmaking: 60, rebounding: 40, defense: 58, ovr: 74 },
    { name: "Len Elmore", pick: 13, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 70, defense: 72, ovr: 64 },
    { name: "Gary Brokaw", pick: 18, pos: ["G"], scoring: 64, playmaking: 55, rebounding: 40, defense: 55, ovr: 62 },
    { name: "Truck Robinson", pick: 22, pos: ["F", "C"], scoring: 74, playmaking: 42, rebounding: 86, defense: 66, ovr: 78 },
    { name: "Bobby Gross", pick: 25, pos: ["F"], scoring: 62, playmaking: 52, rebounding: 52, defense: 58, ovr: 64 },
    { name: "Phil Smith", pick: 29, pos: ["G"], scoring: 76, playmaking: 58, rebounding: 42, defense: 62, ovr: 72 },
    { name: "Bobby Jones", pick: 34, pos: ["F"], scoring: 72, playmaking: 50, rebounding: 72, defense: 88, ovr: 82 },
  ]},
  { year: 1975, players: [
    { name: "David Thompson", pick: 1, pos: ["G", "F"], scoring: 92, playmaking: 60, rebounding: 55, defense: 60, ovr: 90 },
    { name: "Marvin Webster", pick: 3, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 74, defense: 80, ovr: 66 },
    { name: "Alvan Adams", pick: 4, pos: ["C"], scoring: 80, playmaking: 68, rebounding: 78, defense: 72, ovr: 82 },
    { name: "Darryl Dawkins", pick: 5, pos: ["C"], scoring: 72, playmaking: 40, rebounding: 78, defense: 72, ovr: 74 },
    { name: "Lionel Hollins", pick: 6, pos: ["G"], scoring: 74, playmaking: 68, rebounding: 45, defense: 78, ovr: 74 },
    { name: "Junior Bridgeman", pick: 8, pos: ["G", "F"], scoring: 76, playmaking: 50, rebounding: 48, defense: 55, ovr: 74 },
    { name: "Bill Robinzine", pick: 10, pos: ["F"], scoring: 62, playmaking: 40, rebounding: 68, defense: 58, ovr: 64 },
    { name: "Joe Meriweather", pick: 11, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 74, defense: 72, ovr: 66 },
    { name: "Bill Andreas", pick: 14, pos: ["F"], scoring: 52, playmaking: 38, rebounding: 58, defense: 52, ovr: 56 },
    { name: "Ricky Sobers", pick: 16, pos: ["G"], scoring: 72, playmaking: 62, rebounding: 42, defense: 62, ovr: 70 },
    { name: "Kevin Grevey", pick: 18, pos: ["G"], scoring: 72, playmaking: 48, rebounding: 42, defense: 52, ovr: 68 },
    { name: "Gus Williams", pick: 20, pos: ["G"], scoring: 84, playmaking: 72, rebounding: 45, defense: 72, ovr: 82 },
    { name: "World B. Free", pick: 23, pos: ["G"], scoring: 84, playmaking: 58, rebounding: 40, defense: 55, ovr: 80 },
    { name: "Lloyd Walton", pick: 26, pos: ["G"], scoring: 60, playmaking: 58, rebounding: 38, defense: 55, ovr: 60 },
    { name: "Dan Roundfield", pick: 56, pos: ["F", "C"], scoring: 76, playmaking: 45, rebounding: 80, defense: 82, ovr: 80 },
  ]},
  { year: 1976, players: [
    { name: "John Lucas", pick: 1, pos: ["G"], scoring: 72, playmaking: 80, rebounding: 38, defense: 60, ovr: 74 },
    { name: "Scott May", pick: 2, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 58, defense: 55, ovr: 66 },
    { name: "Leon Douglas", pick: 4, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 72, defense: 66, ovr: 62 },
    { name: "Adrian Dantley", pick: 6, pos: ["F"], scoring: 90, playmaking: 55, rebounding: 62, defense: 55, ovr: 88 },
    { name: "Quinn Buckner", pick: 7, pos: ["G"], scoring: 66, playmaking: 68, rebounding: 45, defense: 82, ovr: 72 },
    { name: "Robert Parish", pick: 8, pos: ["C"], scoring: 82, playmaking: 45, rebounding: 88, defense: 80, ovr: 88 },
    { name: "Ron Lee", pick: 10, pos: ["G"], scoring: 64, playmaking: 55, rebounding: 45, defense: 68, ovr: 64 },
    { name: "Terry Furlow", pick: 11, pos: ["G"], scoring: 70, playmaking: 52, rebounding: 42, defense: 50, ovr: 66 },
    { name: "Mitch Kupchak", pick: 13, pos: ["F", "C"], scoring: 68, playmaking: 42, rebounding: 72, defense: 62, ovr: 70 },
    { name: "Sonny Parker", pick: 17, pos: ["G", "F"], scoring: 66, playmaking: 48, rebounding: 55, defense: 58, ovr: 66 },
    { name: "Steve Sheppard", pick: 22, pos: ["F"], scoring: 55, playmaking: 40, rebounding: 55, defense: 52, ovr: 56 },
    { name: "Alex English", pick: 23, pos: ["F"], scoring: 88, playmaking: 58, rebounding: 55, defense: 55, ovr: 86 },
    { name: "Lonnie Shelton", pick: 25, pos: ["F", "C"], scoring: 66, playmaking: 42, rebounding: 72, defense: 72, ovr: 70 },
    { name: "Robert Reid", pick: 40, pos: ["F"], scoring: 68, playmaking: 48, rebounding: 55, defense: 72, ovr: 68 },
    { name: "Major Jones", pick: 44, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 68, defense: 66, ovr: 60 },
  ]},
  { year: 1977, players: [
    { name: "Otis Birdsong", pick: 2, pos: ["G"], scoring: 80, playmaking: 58, rebounding: 42, defense: 58, ovr: 78 },
    { name: "Marques Johnson", pick: 3, pos: ["F"], scoring: 85, playmaking: 60, rebounding: 72, defense: 65, ovr: 84 },
    { name: "Greg Ballard", pick: 4, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 62, defense: 58, ovr: 70 },
    { name: "Walter Davis", pick: 5, pos: ["G", "F"], scoring: 84, playmaking: 58, rebounding: 48, defense: 58, ovr: 82 },
    { name: "Kenny Carr", pick: 6, pos: ["F"], scoring: 66, playmaking: 42, rebounding: 68, defense: 58, ovr: 66 },
    { name: "Bernard King", pick: 7, pos: ["F"], scoring: 92, playmaking: 52, rebounding: 62, defense: 55, ovr: 89 },
    { name: "Jack Sikma", pick: 8, pos: ["C"], scoring: 80, playmaking: 55, rebounding: 84, defense: 75, ovr: 82 },
    { name: "Tom LaGarde", pick: 9, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 68, defense: 60, ovr: 62 },
    { name: "Ernie Grunfeld", pick: 11, pos: ["G", "F"], scoring: 68, playmaking: 48, rebounding: 50, defense: 55, ovr: 66 },
    { name: "Cedric Maxwell", pick: 12, pos: ["F"], scoring: 74, playmaking: 50, rebounding: 68, defense: 62, ovr: 74 },
    { name: "Tree Rollins", pick: 14, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 78, defense: 85, ovr: 72 },
    { name: "Rickey Green", pick: 16, pos: ["G"], scoring: 72, playmaking: 75, rebounding: 40, defense: 68, ovr: 72 },
    { name: "Marty Byrnes", pick: 19, pos: ["F"], scoring: 55, playmaking: 40, rebounding: 55, defense: 52, ovr: 56 },
    { name: "Norm Nixon", pick: 22, pos: ["G"], scoring: 80, playmaking: 80, rebounding: 42, defense: 65, ovr: 80 },
  ]},
  { year: 1978, players: [
    { name: "Mychal Thompson", pick: 1, pos: ["F", "C"], scoring: 78, playmaking: 50, rebounding: 76, defense: 68, ovr: 78 },
    { name: "Rick Robey", pick: 3, pos: ["C"], scoring: 62, playmaking: 40, rebounding: 72, defense: 62, ovr: 66 },
    { name: "Micheal Ray Richardson", pick: 4, pos: ["G"], scoring: 80, playmaking: 82, rebounding: 55, defense: 82, ovr: 82 },
    { name: "Purvis Short", pick: 5, pos: ["F"], scoring: 80, playmaking: 48, rebounding: 58, defense: 52, ovr: 76 },
    { name: "Larry Bird", pick: 6, pos: ["F"], scoring: 96, playmaking: 82, rebounding: 85, defense: 72, ovr: 98 },
    { name: "Ron Brewer", pick: 7, pos: ["G"], scoring: 74, playmaking: 55, rebounding: 45, defense: 60, ovr: 70 },
    { name: "Reggie Theus", pick: 9, pos: ["G"], scoring: 82, playmaking: 72, rebounding: 45, defense: 58, ovr: 80 },
    { name: "Butch Lee", pick: 10, pos: ["G"], scoring: 62, playmaking: 58, rebounding: 38, defense: 52, ovr: 60 },
    { name: "Winford Boynes", pick: 13, pos: ["G"], scoring: 60, playmaking: 45, rebounding: 42, defense: 50, ovr: 58 },
    { name: "Mike Mitchell", pick: 15, pos: ["F"], scoring: 80, playmaking: 42, rebounding: 58, defense: 52, ovr: 76 },
    { name: "Terry Tyler", pick: 23, pos: ["F"], scoring: 66, playmaking: 42, rebounding: 68, defense: 72, ovr: 68 },
    { name: "Maurice Cheeks", pick: 36, pos: ["G"], scoring: 78, playmaking: 85, rebounding: 42, defense: 88, ovr: 84 },
    { name: "Wayne Cooper", pick: 40, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 74, defense: 78, ovr: 66 },
    { name: "Steve Malovic", pick: 44, pos: ["C"], scoring: 48, playmaking: 30, rebounding: 60, defense: 55, ovr: 54 },
  ]},
  { year: 1979, players: [
    { name: "Magic Johnson", pick: 1, pos: ["G","F"], scoring: 88, playmaking: 99, rebounding: 82, defense: 78, ovr: 98 },
    { name: "David Greenwood", pick: 2, pos: ["F","C"], scoring: 73, playmaking: 52, rebounding: 85, defense: 74, ovr: 74 },
    { name: "Bill Cartwright", pick: 3, pos: ["C"], scoring: 76, playmaking: 45, rebounding: 78, defense: 68, ovr: 76 },
    { name: "Kelvin Ransey", pick: 4, pos: ["G"], scoring: 74, playmaking: 78, rebounding: 35, defense: 62, ovr: 73 },
    { name: "Sidney Moncrief", pick: 5, pos: ["G","F"], scoring: 84, playmaking: 70, rebounding: 72, defense: 90, ovr: 86 },
    { name: "Vinnie Johnson", pick: 7, pos: ["G"], scoring: 81, playmaking: 63, rebounding: 42, defense: 68, ovr: 78 },
    { name: "Larry Demic", pick: 9, pos: ["F", "C"], scoring: 55, playmaking: 40, rebounding: 62, defense: 55, ovr: 58 },
    { name: "Calvin Natt", pick: 12, pos: ["F"], scoring: 80, playmaking: 50, rebounding: 78, defense: 66, ovr: 78 },
    { name: "Sly Williams", pick: 21, pos: ["F"], scoring: 62, playmaking: 45, rebounding: 55, defense: 52, ovr: 62 },
    { name: "Reggie King", pick: 23, pos: ["F", "C"], scoring: 58, playmaking: 40, rebounding: 66, defense: 60, ovr: 60 },
    { name: "Jeff Ruland", pick: 25, pos: ["C"], scoring: 77, playmaking: 52, rebounding: 88, defense: 70, ovr: 79 },
    { name: "Jim Paxson", pick: 26, pos: ["G"], scoring: 76, playmaking: 62, rebounding: 38, defense: 60, ovr: 77 },
    { name: "Bill Laimbeer", pick: 65, pos: ["C"], scoring: 72, playmaking: 48, rebounding: 92, defense: 80, ovr: 82 },
  ]},
  { year: 1980, players: [
    { name: "Joe Barry Carroll", pick: 1, pos: ["C"], scoring: 76, playmaking: 45, rebounding: 80, defense: 72, ovr: 76 },
    { name: "Darrell Griffith", pick: 2, pos: ["G"], scoring: 82, playmaking: 52, rebounding: 45, defense: 55, ovr: 78 },
    { name: "Kevin McHale", pick: 3, pos: ["F"], scoring: 88, playmaking: 50, rebounding: 78, defense: 85, ovr: 90 },
    { name: "James Ray", pick: 5, pos: ["F"], scoring: 55, playmaking: 40, rebounding: 62, defense: 55, ovr: 58 },
    { name: "Mike Gminski", pick: 7, pos: ["C"], scoring: 74, playmaking: 45, rebounding: 74, defense: 62, ovr: 72 },
    { name: "Andrew Toney", pick: 8, pos: ["G"], scoring: 84, playmaking: 68, rebounding: 40, defense: 60, ovr: 80 },
    { name: "Michael Brooks", pick: 9, pos: ["F"], scoring: 70, playmaking: 48, rebounding: 60, defense: 55, ovr: 68 },
    { name: "Kiki Vandeweghe", pick: 11, pos: ["F"], scoring: 85, playmaking: 52, rebounding: 52, defense: 48, ovr: 82 },
    { name: "Roger Phegley", pick: 14, pos: ["G"], scoring: 62, playmaking: 45, rebounding: 40, defense: 50, ovr: 58 },
    { name: "Larry Drew", pick: 17, pos: ["G"], scoring: 66, playmaking: 70, rebounding: 38, defense: 58, ovr: 66 },
    { name: "Bill Hanzlik", pick: 20, pos: ["G", "F"], scoring: 55, playmaking: 45, rebounding: 45, defense: 80, ovr: 64 },
    { name: "Larry Smith", pick: 24, pos: ["F", "C"], scoring: 55, playmaking: 35, rebounding: 84, defense: 72, ovr: 72 },
    { name: "Kurt Nimphius", pick: 29, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 66, defense: 70, ovr: 60 },
    { name: "Rory Sparrow", pick: 41, pos: ["G"], scoring: 66, playmaking: 68, rebounding: 40, defense: 65, ovr: 66 },
  ]},
  { year: 1981, players: [
    { name: "Mark Aguirre", pick: 1, pos: ["F"], scoring: 88, playmaking: 58, rebounding: 58, defense: 52, ovr: 84 },
    { name: "Isiah Thomas", pick: 2, pos: ["G"], scoring: 88, playmaking: 92, rebounding: 45, defense: 72, ovr: 92 },
    { name: "Buck Williams", pick: 3, pos: ["F"], scoring: 76, playmaking: 45, rebounding: 88, defense: 80, ovr: 84 },
    { name: "Orlando Woolridge", pick: 6, pos: ["F"], scoring: 80, playmaking: 48, rebounding: 58, defense: 55, ovr: 76 },
    { name: "Steve Johnson", pick: 7, pos: ["C"], scoring: 66, playmaking: 38, rebounding: 68, defense: 62, ovr: 66 },
    { name: "Tom Chambers", pick: 8, pos: ["F"], scoring: 84, playmaking: 50, rebounding: 62, defense: 55, ovr: 82 },
    { name: "Rolando Blackman", pick: 9, pos: ["G"], scoring: 82, playmaking: 60, rebounding: 48, defense: 65, ovr: 82 },
    { name: "Frank Johnson", pick: 11, pos: ["G"], scoring: 66, playmaking: 68, rebounding: 38, defense: 58, ovr: 66 },
    { name: "Kelly Tripucka", pick: 12, pos: ["G", "F"], scoring: 80, playmaking: 52, rebounding: 50, defense: 52, ovr: 76 },
    { name: "Herb Williams", pick: 14, pos: ["C"], scoring: 66, playmaking: 40, rebounding: 76, defense: 78, ovr: 72 },
    { name: "Jeff Lamp", pick: 15, pos: ["G"], scoring: 58, playmaking: 45, rebounding: 42, defense: 50, ovr: 58 },
    { name: "Larry Nance", pick: 20, pos: ["F", "C"], scoring: 82, playmaking: 48, rebounding: 74, defense: 82, ovr: 84 },
    { name: "Eddie Johnson", pick: 29, pos: ["F"], scoring: 84, playmaking: 50, rebounding: 55, defense: 52, ovr: 80 },
    { name: "Danny Ainge", pick: 31, pos: ["G"], scoring: 78, playmaking: 68, rebounding: 45, defense: 72, ovr: 78 },
    { name: "Ed Rains", pick: 34, pos: ["F"], scoring: 52, playmaking: 38, rebounding: 55, defense: 52, ovr: 56 },
  ]},
  { year: 1982, players: [
    { name: "James Worthy", pick: 1, pos: ["F"], scoring: 86, playmaking: 58, rebounding: 60, defense: 62, ovr: 86 },
    { name: "Terry Cummings", pick: 2, pos: ["F"], scoring: 84, playmaking: 50, rebounding: 74, defense: 62, ovr: 82 },
    { name: "Dominique Wilkins", pick: 3, pos: ["F"], scoring: 90, playmaking: 52, rebounding: 62, defense: 55, ovr: 88 },
    { name: "Bill Garnett", pick: 4, pos: ["F", "C"], scoring: 55, playmaking: 38, rebounding: 66, defense: 58, ovr: 60 },
    { name: "LaSalle Thompson", pick: 5, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 78, defense: 72, ovr: 70 },
    { name: "Trent Tucker", pick: 6, pos: ["G"], scoring: 72, playmaking: 48, rebounding: 42, defense: 55, ovr: 70 },
    { name: "Quintin Dailey", pick: 7, pos: ["G"], scoring: 76, playmaking: 50, rebounding: 42, defense: 48, ovr: 70 },
    { name: "Clark Kellogg", pick: 8, pos: ["F"], scoring: 76, playmaking: 48, rebounding: 72, defense: 58, ovr: 74 },
    { name: "Fat Lever", pick: 11, pos: ["G"], scoring: 78, playmaking: 78, rebounding: 62, defense: 78, ovr: 80 },
    { name: "John Bagley", pick: 12, pos: ["G"], scoring: 66, playmaking: 72, rebounding: 38, defense: 55, ovr: 66 },
    { name: "Sleepy Floyd", pick: 13, pos: ["G"], scoring: 78, playmaking: 72, rebounding: 42, defense: 62, ovr: 76 },
    { name: "David Thirdkill", pick: 15, pos: ["F"], scoring: 55, playmaking: 40, rebounding: 52, defense: 58, ovr: 58 },
    { name: "Ricky Pierce", pick: 18, pos: ["G"], scoring: 80, playmaking: 50, rebounding: 42, defense: 50, ovr: 76 },
    { name: "Paul Pressey", pick: 20, pos: ["G", "F"], scoring: 72, playmaking: 72, rebounding: 52, defense: 80, ovr: 76 },
    { name: "Mark McNamara", pick: 22, pos: ["C"], scoring: 48, playmaking: 30, rebounding: 66, defense: 58, ovr: 56 },
  ]},
  { year: 1983, players: [
    { name: "Ralph Sampson", pick: 1, pos: ["C"], scoring: 82, playmaking: 50, rebounding: 82, defense: 78, ovr: 82 },
    { name: "Steve Stipanovich", pick: 2, pos: ["C"], scoring: 66, playmaking: 42, rebounding: 70, defense: 66, ovr: 68 },
    { name: "Rodney McCray", pick: 3, pos: ["F"], scoring: 72, playmaking: 58, rebounding: 68, defense: 72, ovr: 74 },
    { name: "Byron Scott", pick: 4, pos: ["G"], scoring: 80, playmaking: 58, rebounding: 45, defense: 62, ovr: 78 },
    { name: "Sidney Green", pick: 5, pos: ["F"], scoring: 62, playmaking: 42, rebounding: 68, defense: 58, ovr: 64 },
    { name: "Thurl Bailey", pick: 7, pos: ["F"], scoring: 74, playmaking: 45, rebounding: 65, defense: 68, ovr: 72 },
    { name: "Antoine Carr", pick: 8, pos: ["F", "C"], scoring: 72, playmaking: 42, rebounding: 62, defense: 62, ovr: 70 },
    { name: "Dale Ellis", pick: 9, pos: ["G", "F"], scoring: 84, playmaking: 45, rebounding: 50, defense: 52, ovr: 80 },
    { name: "Jeff Malone", pick: 10, pos: ["G"], scoring: 82, playmaking: 50, rebounding: 42, defense: 52, ovr: 78 },
    { name: "Derek Harper", pick: 11, pos: ["G"], scoring: 76, playmaking: 78, rebounding: 42, defense: 80, ovr: 78 },
    { name: "Darrell Walker", pick: 12, pos: ["G"], scoring: 64, playmaking: 58, rebounding: 48, defense: 78, ovr: 68 },
    { name: "Ennis Whatley", pick: 13, pos: ["G"], scoring: 60, playmaking: 68, rebounding: 40, defense: 55, ovr: 62 },
    { name: "Clyde Drexler", pick: 14, pos: ["G", "F"], scoring: 88, playmaking: 72, rebounding: 65, defense: 72, ovr: 90 },
    { name: "John Paxson", pick: 19, pos: ["G"], scoring: 68, playmaking: 65, rebounding: 38, defense: 58, ovr: 68 },
    { name: "Doc Rivers", pick: 31, pos: ["G"], scoring: 74, playmaking: 78, rebounding: 45, defense: 78, ovr: 76 },
    { name: "Craig Ehlo", pick: 48, pos: ["G"], scoring: 64, playmaking: 52, rebounding: 45, defense: 70, ovr: 66 },
  ]},
  { year: 1984, players: [
    { name: "Hakeem Olajuwon", pick: 1, pos: ["C"], scoring: 92, playmaking: 62, rebounding: 96, defense: 97, ovr: 98 },
    { name: "Sam Bowie", pick: 2, pos: ["C"], scoring: 68, playmaking: 45, rebounding: 82, defense: 74, ovr: 68 },
    { name: "Sam Perkins", pick: 4, pos: ["F","C"], scoring: 76, playmaking: 55, rebounding: 80, defense: 74, ovr: 78 },
    { name: "Charles Barkley", pick: 5, pos: ["F"], scoring: 91, playmaking: 68, rebounding: 95, defense: 78, ovr: 96 },
    { name: "Melvin Turpin", pick: 6, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 66, defense: 58, ovr: 62 },
    { name: "Alvin Robertson", pick: 7, pos: ["G"], scoring: 79, playmaking: 70, rebounding: 55, defense: 92, ovr: 80 },
    { name: "Lancaster Gordon", pick: 8, pos: ["G"], scoring: 62, playmaking: 48, rebounding: 42, defense: 55, ovr: 60 },
    { name: "Otis Thorpe", pick: 9, pos: ["F","C"], scoring: 74, playmaking: 42, rebounding: 84, defense: 72, ovr: 78 },
    { name: "Leon Wood", pick: 10, pos: ["G"], scoring: 60, playmaking: 68, rebounding: 38, defense: 50, ovr: 60 },
    { name: "Kevin Willis", pick: 11, pos: ["F","C"], scoring: 76, playmaking: 40, rebounding: 86, defense: 68, ovr: 78 },
    { name: "Tim McCormick", pick: 12, pos: ["C"], scoring: 58, playmaking: 38, rebounding: 64, defense: 58, ovr: 60 },
    { name: "Jay Humphries", pick: 13, pos: ["G"], scoring: 66, playmaking: 62, rebounding: 42, defense: 62, ovr: 66 },
    { name: "Michael Cage", pick: 14, pos: ["F","C"], scoring: 58, playmaking: 35, rebounding: 82, defense: 70, ovr: 71 },
    { name: "Terence Stansbury", pick: 15, pos: ["G"], scoring: 62, playmaking: 45, rebounding: 40, defense: 50, ovr: 60 },
    { name: "John Stockton", pick: 16, pos: ["G"], scoring: 78, playmaking: 99, rebounding: 40, defense: 82, ovr: 93 },
    { name: "Vern Fleming", pick: 18, pos: ["G"], scoring: 72, playmaking: 68, rebounding: 40, defense: 65, ovr: 73 },
    { name: "Jerome Kersey", pick: 46, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 68, defense: 72, ovr: 72 },
  ]},
  { year: 1985, players: [
    { name: "Patrick Ewing", pick: 1, pos: ["C"], scoring: 88, playmaking: 50, rebounding: 90, defense: 90, ovr: 94 },
    { name: "Wayman Tisdale", pick: 2, pos: ["F"], scoring: 78, playmaking: 42, rebounding: 64, defense: 52, ovr: 74 },
    { name: "Benoit Benjamin", pick: 3, pos: ["C"], scoring: 60, playmaking: 35, rebounding: 78, defense: 65, ovr: 70 },
    { name: "Xavier McDaniel", pick: 4, pos: ["F"], scoring: 82, playmaking: 45, rebounding: 78, defense: 76, ovr: 79 },
    { name: "Jon Koncak", pick: 5, pos: ["C"], scoring: 52, playmaking: 35, rebounding: 66, defense: 66, ovr: 58 },
    { name: "Joe Kleine", pick: 6, pos: ["C"], scoring: 50, playmaking: 30, rebounding: 72, defense: 60, ovr: 65 },
    { name: "Chris Mullin", pick: 7, pos: ["G","F"], scoring: 88, playmaking: 65, rebounding: 50, defense: 62, ovr: 88 },
    { name: "Detlef Schrempf", pick: 8, pos: ["F"], scoring: 80, playmaking: 68, rebounding: 74, defense: 65, ovr: 82 },
    { name: "Charles Oakley", pick: 9, pos: ["F"], scoring: 68, playmaking: 45, rebounding: 90, defense: 78, ovr: 79 },
    { name: "Keith Lee", pick: 11, pos: ["F", "C"], scoring: 58, playmaking: 42, rebounding: 64, defense: 55, ovr: 60 },
    { name: "Kenny Green", pick: 12, pos: ["F"], scoring: 58, playmaking: 40, rebounding: 52, defense: 50, ovr: 56 },
    { name: "Karl Malone", pick: 13, pos: ["F"], scoring: 93, playmaking: 60, rebounding: 90, defense: 78, ovr: 96 },
    { name: "Blair Rasmussen", pick: 15, pos: ["C"], scoring: 58, playmaking: 38, rebounding: 64, defense: 55, ovr: 60 },
    { name: "Joe Dumars", pick: 18, pos: ["G"], scoring: 82, playmaking: 75, rebounding: 42, defense: 88, ovr: 87 },
    { name: "A.C. Green", pick: 23, pos: ["F"], scoring: 70, playmaking: 42, rebounding: 84, defense: 74, ovr: 75 },
    { name: "Terry Porter", pick: 24, pos: ["G"], scoring: 78, playmaking: 82, rebounding: 40, defense: 70, ovr: 82 },
  ]},
  { year: 1986, players: [
    { name: "Brad Daugherty", pick: 1, pos: ["C"], scoring: 82, playmaking: 68, rebounding: 80, defense: 68, ovr: 82 },
    { name: "Chuck Person", pick: 4, pos: ["F"], scoring: 80, playmaking: 52, rebounding: 58, defense: 50, ovr: 76 },
    { name: "William Bedford", pick: 6, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 66, defense: 58, ovr: 58 },
    { name: "Roy Tarpley", pick: 7, pos: ["F", "C"], scoring: 72, playmaking: 42, rebounding: 84, defense: 72, ovr: 76 },
    { name: "Ron Harper", pick: 8, pos: ["G"], scoring: 82, playmaking: 62, rebounding: 55, defense: 78, ovr: 82 },
    { name: "Johnny Dawkins", pick: 10, pos: ["G"], scoring: 72, playmaking: 68, rebounding: 42, defense: 58, ovr: 72 },
    { name: "John Salley", pick: 11, pos: ["F", "C"], scoring: 62, playmaking: 42, rebounding: 68, defense: 78, ovr: 70 },
    { name: "Pearl Washington", pick: 13, pos: ["G"], scoring: 64, playmaking: 68, rebounding: 38, defense: 52, ovr: 62 },
    { name: "Dell Curry", pick: 15, pos: ["G"], scoring: 76, playmaking: 48, rebounding: 42, defense: 52, ovr: 72 },
    { name: "Scott Skiles", pick: 22, pos: ["G"], scoring: 66, playmaking: 78, rebounding: 40, defense: 55, ovr: 68 },
    { name: "Arvydas Sabonis", pick: 24, pos: ["C"], scoring: 80, playmaking: 72, rebounding: 80, defense: 72, ovr: 82 },
    { name: "Mark Price", pick: 25, pos: ["G"], scoring: 82, playmaking: 88, rebounding: 40, defense: 60, ovr: 84 },
    { name: "Dennis Rodman", pick: 27, pos: ["F"], scoring: 52, playmaking: 35, rebounding: 94, defense: 92, ovr: 84 },
    { name: "Nate McMillan", pick: 30, pos: ["G"], scoring: 58, playmaking: 72, rebounding: 45, defense: 82, ovr: 70 },
    { name: "Kevin Duckworth", pick: 33, pos: ["C"], scoring: 68, playmaking: 40, rebounding: 72, defense: 60, ovr: 68 },
    { name: "Jeff Hornacek", pick: 46, pos: ["G"], scoring: 78, playmaking: 72, rebounding: 45, defense: 62, ovr: 78 },
  ]},
  { year: 1987, players: [
    { name: "David Robinson", pick: 1, pos: ["C"], scoring: 92, playmaking: 55, rebounding: 90, defense: 92, ovr: 96 },
    { name: "Armon Gilliam", pick: 2, pos: ["F", "C"], scoring: 76, playmaking: 45, rebounding: 72, defense: 60, ovr: 74 },
    { name: "Scottie Pippen", pick: 5, pos: ["F"], scoring: 85, playmaking: 80, rebounding: 68, defense: 90, ovr: 90 },
    { name: "Kenny Smith", pick: 6, pos: ["G"], scoring: 74, playmaking: 72, rebounding: 40, defense: 58, ovr: 72 },
    { name: "Kevin Johnson", pick: 7, pos: ["G"], scoring: 84, playmaking: 88, rebounding: 45, defense: 62, ovr: 86 },
    { name: "Derrick McKey", pick: 9, pos: ["F"], scoring: 72, playmaking: 52, rebounding: 58, defense: 72, ovr: 72 },
    { name: "Horace Grant", pick: 10, pos: ["F"], scoring: 72, playmaking: 48, rebounding: 80, defense: 78, ovr: 78 },
    { name: "Reggie Miller", pick: 11, pos: ["G"], scoring: 88, playmaking: 55, rebounding: 45, defense: 60, ovr: 88 },
    { name: "Muggsy Bogues", pick: 12, pos: ["G"], scoring: 58, playmaking: 80, rebounding: 42, defense: 72, ovr: 68 },
    { name: "Tellis Frank", pick: 14, pos: ["F"], scoring: 55, playmaking: 40, rebounding: 58, defense: 55, ovr: 58 },
    { name: "Mark Jackson", pick: 18, pos: ["G"], scoring: 74, playmaking: 85, rebounding: 50, defense: 60, ovr: 78 },
    { name: "Ken Norman", pick: 19, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 62, defense: 55, ovr: 70 },
    { name: "Reggie Lewis", pick: 22, pos: ["G", "F"], scoring: 82, playmaking: 55, rebounding: 55, defense: 68, ovr: 80 },
    { name: "Greg Anderson", pick: 23, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 72, defense: 68, ovr: 64 },
    { name: "Winston Garland", pick: 40, pos: ["G"], scoring: 64, playmaking: 58, rebounding: 42, defense: 60, ovr: 64 },
    { name: "Kevin Gamble", pick: 63, pos: ["G", "F"], scoring: 68, playmaking: 50, rebounding: 45, defense: 55, ovr: 66 },
  ]},
  { year: 1988, players: [
    { name: "Danny Manning", pick: 1, pos: ["F"], scoring: 80, playmaking: 55, rebounding: 68, defense: 65, ovr: 80 },
    { name: "Rik Smits", pick: 2, pos: ["C"], scoring: 78, playmaking: 45, rebounding: 72, defense: 62, ovr: 76 },
    { name: "Charles Smith", pick: 3, pos: ["F"], scoring: 76, playmaking: 42, rebounding: 68, defense: 68, ovr: 74 },
    { name: "Mitch Richmond", pick: 5, pos: ["G"], scoring: 86, playmaking: 62, rebounding: 50, defense: 62, ovr: 84 },
    { name: "Hersey Hawkins", pick: 6, pos: ["G"], scoring: 80, playmaking: 60, rebounding: 45, defense: 68, ovr: 78 },
    { name: "Rony Seikaly", pick: 9, pos: ["C"], scoring: 72, playmaking: 40, rebounding: 76, defense: 66, ovr: 72 },
    { name: "Willie Anderson", pick: 10, pos: ["G", "F"], scoring: 72, playmaking: 62, rebounding: 50, defense: 62, ovr: 72 },
    { name: "Jeff Grayer", pick: 13, pos: ["G", "F"], scoring: 66, playmaking: 48, rebounding: 50, defense: 58, ovr: 66 },
    { name: "Dan Majerle", pick: 14, pos: ["G", "F"], scoring: 78, playmaking: 60, rebounding: 58, defense: 70, ovr: 78 },
    { name: "Ricky Berry", pick: 18, pos: ["F"], scoring: 62, playmaking: 42, rebounding: 45, defense: 50, ovr: 60 },
    { name: "Rod Strickland", pick: 19, pos: ["G"], scoring: 78, playmaking: 88, rebounding: 48, defense: 65, ovr: 80 },
    { name: "Kevin Edwards", pick: 20, pos: ["G"], scoring: 70, playmaking: 52, rebounding: 42, defense: 55, ovr: 68 },
    { name: "Steve Kerr", pick: 50, pos: ["G"], scoring: 72, playmaking: 58, rebounding: 35, defense: 55, ovr: 70 },
  ]},
  { year: 1989, players: [
    { name: "Pervis Ellison", pick: 1, pos: ["C"], scoring: 62, playmaking: 40, rebounding: 72, defense: 72, ovr: 66 },
    { name: "Sean Elliott", pick: 3, pos: ["F"], scoring: 78, playmaking: 55, rebounding: 58, defense: 58, ovr: 76 },
    { name: "Glen Rice", pick: 4, pos: ["F"], scoring: 86, playmaking: 50, rebounding: 52, defense: 52, ovr: 82 },
    { name: "Stacey King", pick: 6, pos: ["F", "C"], scoring: 62, playmaking: 42, rebounding: 62, defense: 55, ovr: 62 },
    { name: "Tom Hammonds", pick: 9, pos: ["F"], scoring: 58, playmaking: 38, rebounding: 60, defense: 55, ovr: 60 },
    { name: "Nick Anderson", pick: 11, pos: ["G", "F"], scoring: 76, playmaking: 55, rebounding: 58, defense: 60, ovr: 74 },
    { name: "Mookie Blaylock", pick: 12, pos: ["G"], scoring: 72, playmaking: 82, rebounding: 48, defense: 88, ovr: 80 },
    { name: "Michael Smith", pick: 13, pos: ["F"], scoring: 60, playmaking: 45, rebounding: 55, defense: 50, ovr: 60 },
    { name: "Tim Hardaway", pick: 14, pos: ["G"], scoring: 85, playmaking: 88, rebounding: 42, defense: 68, ovr: 86 },
    { name: "Dana Barros", pick: 16, pos: ["G"], scoring: 76, playmaking: 62, rebounding: 38, defense: 52, ovr: 72 },
    { name: "Shawn Kemp", pick: 17, pos: ["F", "C"], scoring: 84, playmaking: 50, rebounding: 82, defense: 75, ovr: 86 },
    { name: "B.J. Armstrong", pick: 18, pos: ["G"], scoring: 72, playmaking: 65, rebounding: 38, defense: 55, ovr: 70 },
    { name: "Blue Edwards", pick: 21, pos: ["G"], scoring: 68, playmaking: 48, rebounding: 48, defense: 60, ovr: 66 },
    { name: "Vlade Divac", pick: 26, pos: ["C"], scoring: 76, playmaking: 72, rebounding: 78, defense: 68, ovr: 80 },
    { name: "Sherman Douglas", pick: 28, pos: ["G"], scoring: 70, playmaking: 74, rebounding: 40, defense: 55, ovr: 68 },
    { name: "Cliff Robinson", pick: 36, pos: ["F", "C"], scoring: 76, playmaking: 48, rebounding: 68, defense: 72, ovr: 76 },
  ]},
  { year: 1990, players: [
    { name: "Derrick Coleman", pick: 1, pos: ["F"], scoring: 82, playmaking: 55, rebounding: 80, defense: 68, ovr: 82 },
    { name: "Gary Payton", pick: 2, pos: ["G"], scoring: 82, playmaking: 82, rebounding: 55, defense: 95, ovr: 90 },
    { name: "Dennis Scott", pick: 4, pos: ["F"], scoring: 78, playmaking: 48, rebounding: 45, defense: 50, ovr: 72 },
    { name: "Kendall Gill", pick: 5, pos: ["G"], scoring: 76, playmaking: 58, rebounding: 52, defense: 68, ovr: 74 },
    { name: "Lionel Simmons", pick: 7, pos: ["F"], scoring: 72, playmaking: 52, rebounding: 62, defense: 55, ovr: 70 },
    { name: "Bo Kimble", pick: 8, pos: ["G"], scoring: 60, playmaking: 45, rebounding: 42, defense: 48, ovr: 58 },
    { name: "Willie Burton", pick: 9, pos: ["F"], scoring: 64, playmaking: 42, rebounding: 52, defense: 50, ovr: 62 },
    { name: "Rumeal Robinson", pick: 10, pos: ["G"], scoring: 62, playmaking: 66, rebounding: 40, defense: 58, ovr: 62 },
    { name: "Tyrone Hill", pick: 11, pos: ["F", "C"], scoring: 60, playmaking: 38, rebounding: 82, defense: 68, ovr: 70 },
    { name: "Loy Vaught", pick: 13, pos: ["F", "C"], scoring: 68, playmaking: 42, rebounding: 74, defense: 58, ovr: 70 },
    { name: "Travis Mays", pick: 14, pos: ["G"], scoring: 64, playmaking: 50, rebounding: 40, defense: 50, ovr: 60 },
    { name: "Terry Mills", pick: 16, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 62, defense: 52, ovr: 66 },
    { name: "Jayson Williams", pick: 21, pos: ["F", "C"], scoring: 58, playmaking: 35, rebounding: 82, defense: 62, ovr: 68 },
    { name: "Elden Campbell", pick: 27, pos: ["C"], scoring: 68, playmaking: 42, rebounding: 72, defense: 78, ovr: 72 },
    { name: "Toni Kukoc", pick: 29, pos: ["F"], scoring: 80, playmaking: 72, rebounding: 58, defense: 58, ovr: 80 },
    { name: "Antonio Davis", pick: 45, pos: ["F", "C"], scoring: 62, playmaking: 40, rebounding: 78, defense: 80, ovr: 74 },
    { name: "Cedric Ceballos", pick: 48, pos: ["F"], scoring: 76, playmaking: 42, rebounding: 60, defense: 50, ovr: 72 },
  ]},
  { year: 1991, players: [
    { name: "Larry Johnson", pick: 1, pos: ["F"], scoring: 80, playmaking: 55, rebounding: 78, defense: 62, ovr: 80 },
    { name: "Kenny Anderson", pick: 2, pos: ["G"], scoring: 76, playmaking: 80, rebounding: 42, defense: 58, ovr: 76 },
    { name: "Billy Owens", pick: 3, pos: ["F"], scoring: 74, playmaking: 58, rebounding: 62, defense: 55, ovr: 72 },
    { name: "Dikembe Mutombo", pick: 4, pos: ["C"], scoring: 62, playmaking: 40, rebounding: 90, defense: 95, ovr: 86 },
    { name: "Steve Smith", pick: 5, pos: ["G"], scoring: 80, playmaking: 65, rebounding: 48, defense: 62, ovr: 78 },
    { name: "Luc Longley", pick: 7, pos: ["C"], scoring: 62, playmaking: 42, rebounding: 68, defense: 66, ovr: 66 },
    { name: "Mark Macon", pick: 8, pos: ["G"], scoring: 60, playmaking: 52, rebounding: 42, defense: 58, ovr: 60 },
    { name: "Stacey Augmon", pick: 9, pos: ["F"], scoring: 66, playmaking: 50, rebounding: 55, defense: 78, ovr: 70 },
    { name: "Terrell Brandon", pick: 11, pos: ["G"], scoring: 78, playmaking: 78, rebounding: 42, defense: 68, ovr: 78 },
    { name: "Greg Anthony", pick: 12, pos: ["G"], scoring: 64, playmaking: 70, rebounding: 40, defense: 62, ovr: 64 },
    { name: "Dale Davis", pick: 13, pos: ["F", "C"], scoring: 62, playmaking: 38, rebounding: 82, defense: 80, ovr: 74 },
    { name: "Chris Gatling", pick: 16, pos: ["F", "C"], scoring: 66, playmaking: 40, rebounding: 68, defense: 58, ovr: 66 },
    { name: "Doug Christie", pick: 17, pos: ["G"], scoring: 72, playmaking: 60, rebounding: 48, defense: 82, ovr: 76 },
    { name: "Rick Fox", pick: 24, pos: ["F"], scoring: 68, playmaking: 55, rebounding: 52, defense: 65, ovr: 68 },
    { name: "Pete Chilcutt", pick: 27, pos: ["F", "C"], scoring: 55, playmaking: 40, rebounding: 62, defense: 55, ovr: 58 },
  ]},
  { year: 1992, players: [
    { name: "Shaquille O'Neal", pick: 1, pos: ["C"], scoring: 95, playmaking: 55, rebounding: 96, defense: 88, ovr: 98 },
    { name: "Alonzo Mourning", pick: 2, pos: ["C"], scoring: 82, playmaking: 45, rebounding: 90, defense: 94, ovr: 90 },
    { name: "Christian Laettner", pick: 3, pos: ["F","C"], scoring: 78, playmaking: 55, rebounding: 78, defense: 68, ovr: 79 },
    { name: "Jim Jackson", pick: 4, pos: ["G","F"], scoring: 80, playmaking: 60, rebounding: 50, defense: 65, ovr: 78 },
    { name: "Tom Gugliotta", pick: 6, pos: ["F"], scoring: 78, playmaking: 62, rebounding: 76, defense: 68, ovr: 80 },
    { name: "Walt Williams", pick: 7, pos: ["G","F"], scoring: 75, playmaking: 55, rebounding: 55, defense: 62, ovr: 74 },
    { name: "Todd Day", pick: 8, pos: ["G", "F"], scoring: 70, playmaking: 45, rebounding: 45, defense: 55, ovr: 68 },
    { name: "Clarence Weatherspoon", pick: 9, pos: ["F"], scoring: 70, playmaking: 42, rebounding: 66, defense: 62, ovr: 70 },
    { name: "Adam Keefe", pick: 10, pos: ["F", "C"], scoring: 58, playmaking: 40, rebounding: 64, defense: 55, ovr: 60 },
    { name: "Robert Horry", pick: 11, pos: ["F"], scoring: 68, playmaking: 55, rebounding: 68, defense: 78, ovr: 78 },
    { name: "Harold Miner", pick: 12, pos: ["G"], scoring: 64, playmaking: 42, rebounding: 40, defense: 45, ovr: 60 },
    { name: "Bryant Stith", pick: 13, pos: ["G"], scoring: 66, playmaking: 48, rebounding: 48, defense: 60, ovr: 66 },
    { name: "Malik Sealy", pick: 14, pos: ["F"], scoring: 68, playmaking: 45, rebounding: 48, defense: 55, ovr: 66 },
    { name: "Don MacLean", pick: 19, pos: ["F"], scoring: 76, playmaking: 45, rebounding: 65, defense: 55, ovr: 70 },
    { name: "Latrell Sprewell", pick: 24, pos: ["G","F"], scoring: 84, playmaking: 65, rebounding: 52, defense: 78, ovr: 84 },
    { name: "P.J. Brown", pick: 29, pos: ["F","C"], scoring: 64, playmaking: 40, rebounding: 82, defense: 80, ovr: 76 },
  ]},
  { year: 1993, players: [
    { name: "Chris Webber", pick: 1, pos: ["F"], scoring: 86, playmaking: 68, rebounding: 82, defense: 72, ovr: 88 },
    { name: "Shawn Bradley", pick: 2, pos: ["C"], scoring: 55, playmaking: 32, rebounding: 68, defense: 80, ovr: 64 },
    { name: "Anfernee Hardaway", pick: 3, pos: ["G"], scoring: 86, playmaking: 82, rebounding: 55, defense: 68, ovr: 86 },
    { name: "Jamal Mashburn", pick: 4, pos: ["F"], scoring: 82, playmaking: 58, rebounding: 58, defense: 52, ovr: 80 },
    { name: "Calbert Cheaney", pick: 6, pos: ["G", "F"], scoring: 72, playmaking: 48, rebounding: 48, defense: 55, ovr: 70 },
    { name: "Vin Baker", pick: 8, pos: ["F", "C"], scoring: 78, playmaking: 45, rebounding: 72, defense: 62, ovr: 76 },
    { name: "Rodney Rogers", pick: 9, pos: ["F"], scoring: 74, playmaking: 52, rebounding: 58, defense: 55, ovr: 72 },
    { name: "Lindsey Hunter", pick: 10, pos: ["G"], scoring: 70, playmaking: 60, rebounding: 40, defense: 72, ovr: 70 },
    { name: "Allan Houston", pick: 11, pos: ["G"], scoring: 82, playmaking: 55, rebounding: 42, defense: 55, ovr: 78 },
    { name: "George Lynch", pick: 12, pos: ["F"], scoring: 62, playmaking: 45, rebounding: 60, defense: 62, ovr: 62 },
    { name: "Terry Dehere", pick: 13, pos: ["G"], scoring: 64, playmaking: 52, rebounding: 40, defense: 50, ovr: 60 },
    { name: "Scott Haskin", pick: 14, pos: ["F", "C"], scoring: 52, playmaking: 35, rebounding: 62, defense: 55, ovr: 56 },
    { name: "Ervin Johnson", pick: 23, pos: ["C"], scoring: 48, playmaking: 30, rebounding: 74, defense: 78, ovr: 62 },
    { name: "Sam Cassell", pick: 24, pos: ["G"], scoring: 80, playmaking: 75, rebounding: 45, defense: 60, ovr: 80 },
    { name: "Gheorghe Muresan", pick: 30, pos: ["C"], scoring: 62, playmaking: 30, rebounding: 72, defense: 72, ovr: 66 },
    { name: "Nick Van Exel", pick: 37, pos: ["G"], scoring: 78, playmaking: 78, rebounding: 40, defense: 55, ovr: 76 },
  ]},
  { year: 1994, players: [
    { name: "Glenn Robinson", pick: 1, pos: ["F"], scoring: 85, playmaking: 52, rebounding: 62, defense: 52, ovr: 82 },
    { name: "Jason Kidd", pick: 2, pos: ["G"], scoring: 80, playmaking: 92, rebounding: 68, defense: 82, ovr: 90 },
    { name: "Grant Hill", pick: 3, pos: ["F"], scoring: 88, playmaking: 80, rebounding: 72, defense: 70, ovr: 90 },
    { name: "Donyell Marshall", pick: 4, pos: ["F", "C"], scoring: 74, playmaking: 45, rebounding: 68, defense: 58, ovr: 72 },
    { name: "Juwan Howard", pick: 5, pos: ["F"], scoring: 78, playmaking: 55, rebounding: 68, defense: 58, ovr: 76 },
    { name: "Sharone Wright", pick: 6, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 70, defense: 60, ovr: 62 },
    { name: "Lamond Murray", pick: 7, pos: ["F"], scoring: 70, playmaking: 45, rebounding: 52, defense: 50, ovr: 68 },
    { name: "Brian Grant", pick: 8, pos: ["F", "C"], scoring: 66, playmaking: 42, rebounding: 76, defense: 68, ovr: 72 },
    { name: "Eric Montross", pick: 9, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 72, defense: 66, ovr: 62 },
    { name: "Eddie Jones", pick: 10, pos: ["G"], scoring: 80, playmaking: 55, rebounding: 50, defense: 78, ovr: 80 },
    { name: "Carlos Rogers", pick: 11, pos: ["F", "C"], scoring: 60, playmaking: 40, rebounding: 66, defense: 60, ovr: 62 },
    { name: "Khalid Reeves", pick: 12, pos: ["G"], scoring: 62, playmaking: 60, rebounding: 40, defense: 52, ovr: 60 },
    { name: "Jalen Rose", pick: 13, pos: ["G", "F"], scoring: 80, playmaking: 68, rebounding: 48, defense: 52, ovr: 78 },
    { name: "Eric Piatkowski", pick: 15, pos: ["G"], scoring: 68, playmaking: 45, rebounding: 42, defense: 50, ovr: 66 },
    { name: "B.J. Tyler", pick: 20, pos: ["G"], scoring: 56, playmaking: 58, rebounding: 36, defense: 50, ovr: 56 },
    { name: "Wesley Person", pick: 23, pos: ["G"], scoring: 74, playmaking: 48, rebounding: 45, defense: 55, ovr: 70 },
  ]},
  { year: 1995, players: [
    { name: "Joe Smith", pick: 1, pos: ["F"], scoring: 76, playmaking: 45, rebounding: 72, defense: 60, ovr: 74 },
    { name: "Antonio McDyess", pick: 2, pos: ["F"], scoring: 78, playmaking: 48, rebounding: 74, defense: 66, ovr: 76 },
    { name: "Jerry Stackhouse", pick: 3, pos: ["G", "F"], scoring: 82, playmaking: 58, rebounding: 48, defense: 55, ovr: 78 },
    { name: "Rasheed Wallace", pick: 4, pos: ["F", "C"], scoring: 80, playmaking: 52, rebounding: 72, defense: 82, ovr: 82 },
    { name: "Kevin Garnett", pick: 5, pos: ["F", "C"], scoring: 88, playmaking: 68, rebounding: 85, defense: 88, ovr: 94 },
    { name: "Bryant Reeves", pick: 6, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 72, defense: 60, ovr: 64 },
    { name: "Damon Stoudamire", pick: 7, pos: ["G"], scoring: 76, playmaking: 78, rebounding: 40, defense: 55, ovr: 74 },
    { name: "Ed O'Bannon", pick: 9, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 55, defense: 52, ovr: 58 },
    { name: "Kurt Thomas", pick: 10, pos: ["F", "C"], scoring: 66, playmaking: 45, rebounding: 74, defense: 72, ovr: 70 },
    { name: "Gary Trent", pick: 11, pos: ["F"], scoring: 66, playmaking: 42, rebounding: 64, defense: 55, ovr: 66 },
    { name: "Cherokee Parks", pick: 12, pos: ["C"], scoring: 58, playmaking: 38, rebounding: 64, defense: 58, ovr: 60 },
    { name: "Corliss Williamson", pick: 13, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 60, defense: 55, ovr: 70 },
    { name: "Eric Williams", pick: 14, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 52, defense: 58, ovr: 66 },
    { name: "Brent Barry", pick: 15, pos: ["G"], scoring: 74, playmaking: 58, rebounding: 45, defense: 58, ovr: 72 },
    { name: "Bob Sura", pick: 17, pos: ["G"], scoring: 64, playmaking: 58, rebounding: 45, defense: 60, ovr: 64 },
    { name: "Theo Ratliff", pick: 18, pos: ["C"], scoring: 55, playmaking: 32, rebounding: 72, defense: 88, ovr: 72 },
    { name: "Michael Finley", pick: 21, pos: ["G", "F"], scoring: 80, playmaking: 58, rebounding: 55, defense: 58, ovr: 78 },
  ]},
  { year: 1996, players: [
    { name: "Allen Iverson", pick: 1, pos: ["G"], scoring: 95, playmaking: 82, rebounding: 40, defense: 78, ovr: 95 },
    { name: "Marcus Camby", pick: 2, pos: ["F","C"], scoring: 68, playmaking: 45, rebounding: 88, defense: 90, ovr: 80 },
    { name: "Shareef Abdur-Rahim", pick: 3, pos: ["F"], scoring: 80, playmaking: 48, rebounding: 66, defense: 52, ovr: 78 },
    { name: "Stephon Marbury", pick: 4, pos: ["G"], scoring: 82, playmaking: 82, rebounding: 42, defense: 55, ovr: 82 },
    { name: "Ray Allen", pick: 5, pos: ["G"], scoring: 90, playmaking: 62, rebounding: 42, defense: 72, ovr: 90 },
    { name: "Antoine Walker", pick: 6, pos: ["F"], scoring: 85, playmaking: 60, rebounding: 78, defense: 60, ovr: 83 },
    { name: "Lorenzen Wright", pick: 7, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 72, defense: 62, ovr: 64 },
    { name: "Kerry Kittles", pick: 8, pos: ["G"], scoring: 72, playmaking: 48, rebounding: 48, defense: 60, ovr: 70 },
    { name: "Erick Dampier", pick: 10, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 72, defense: 68, ovr: 64 },
    { name: "Kobe Bryant", pick: 13, pos: ["G"], scoring: 96, playmaking: 78, rebounding: 55, defense: 88, ovr: 98 },
    { name: "Peja Stojakovic", pick: 14, pos: ["F"], scoring: 84, playmaking: 48, rebounding: 55, defense: 55, ovr: 83 },
    { name: "Steve Nash", pick: 15, pos: ["G"], scoring: 82, playmaking: 98, rebounding: 38, defense: 55, ovr: 93 },
    { name: "Tony Delk", pick: 16, pos: ["G"], scoring: 66, playmaking: 48, rebounding: 40, defense: 52, ovr: 64 },
    { name: "Jermaine O'Neal", pick: 17, pos: ["F","C"], scoring: 80, playmaking: 45, rebounding: 82, defense: 85, ovr: 85 },
    { name: "Zydrunas Ilgauskas", pick: 20, pos: ["C"], scoring: 75, playmaking: 40, rebounding: 82, defense: 78, ovr: 79 },
    { name: "Derek Fisher", pick: 24, pos: ["G"], scoring: 68, playmaking: 68, rebounding: 35, defense: 68, ovr: 74 },
  ]},
  { year: 1997, players: [
    { name: "Tim Duncan", pick: 1, pos: ["C"], scoring: 90, playmaking: 60, rebounding: 92, defense: 92, ovr: 97 },
    { name: "Keith Van Horn", pick: 2, pos: ["F"], scoring: 80, playmaking: 48, rebounding: 62, defense: 52, ovr: 78 },
    { name: "Chauncey Billups", pick: 3, pos: ["G"], scoring: 82, playmaking: 78, rebounding: 45, defense: 72, ovr: 84 },
    { name: "Tony Battie", pick: 5, pos: ["F", "C"], scoring: 60, playmaking: 40, rebounding: 66, defense: 66, ovr: 62 },
    { name: "Ron Mercer", pick: 6, pos: ["G", "F"], scoring: 74, playmaking: 48, rebounding: 48, defense: 55, ovr: 70 },
    { name: "Tim Thomas", pick: 7, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 55, defense: 52, ovr: 68 },
    { name: "Adonal Foyle", pick: 8, pos: ["C"], scoring: 45, playmaking: 30, rebounding: 68, defense: 80, ovr: 62 },
    { name: "Tracy McGrady", pick: 9, pos: ["G", "F"], scoring: 90, playmaking: 72, rebounding: 62, defense: 62, ovr: 90 },
    { name: "Danny Fortson", pick: 10, pos: ["F", "C"], scoring: 62, playmaking: 38, rebounding: 80, defense: 60, ovr: 68 },
    { name: "Derek Anderson", pick: 13, pos: ["G"], scoring: 74, playmaking: 58, rebounding: 45, defense: 60, ovr: 72 },
    { name: "Maurice Taylor", pick: 14, pos: ["F"], scoring: 70, playmaking: 42, rebounding: 58, defense: 50, ovr: 68 },
    { name: "Brevin Knight", pick: 16, pos: ["G"], scoring: 62, playmaking: 74, rebounding: 38, defense: 68, ovr: 64 },
    { name: "Bobby Jackson", pick: 23, pos: ["G"], scoring: 70, playmaking: 62, rebounding: 45, defense: 68, ovr: 70 },
  ]},
  { year: 1998, players: [
    { name: "Michael Olowokandi", pick: 1, pos: ["C"], scoring: 62, playmaking: 35, rebounding: 72, defense: 60, ovr: 64 },
    { name: "Mike Bibby", pick: 2, pos: ["G"], scoring: 78, playmaking: 84, rebounding: 35, defense: 60, ovr: 82 },
    { name: "Antawn Jamison", pick: 4, pos: ["F"], scoring: 84, playmaking: 45, rebounding: 76, defense: 55, ovr: 83 },
    { name: "Vince Carter", pick: 5, pos: ["G","F"], scoring: 90, playmaking: 55, rebounding: 55, defense: 65, ovr: 90 },
    { name: "Robert Traylor", pick: 6, pos: ["F","C"], scoring: 58, playmaking: 35, rebounding: 72, defense: 58, ovr: 62 },
    { name: "Jason Williams", pick: 7, pos: ["G"], scoring: 72, playmaking: 80, rebounding: 40, defense: 48, ovr: 72 },
    { name: "Larry Hughes", pick: 8, pos: ["G"], scoring: 78, playmaking: 55, rebounding: 42, defense: 68, ovr: 77 },
    { name: "Dirk Nowitzki", pick: 9, pos: ["F"], scoring: 93, playmaking: 68, rebounding: 78, defense: 60, ovr: 96 },
    { name: "Paul Pierce", pick: 10, pos: ["G","F"], scoring: 90, playmaking: 68, rebounding: 62, defense: 72, ovr: 91 },
    { name: "Bonzi Wells", pick: 11, pos: ["G","F"], scoring: 76, playmaking: 52, rebounding: 55, defense: 62, ovr: 76 },
    { name: "Michael Doleac", pick: 12, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 68, defense: 55, ovr: 62 },
    { name: "Keon Clark", pick: 13, pos: ["F", "C"], scoring: 62, playmaking: 38, rebounding: 66, defense: 72, ovr: 64 },
    { name: "Michael Dickerson", pick: 14, pos: ["G"], scoring: 70, playmaking: 45, rebounding: 42, defense: 48, ovr: 66 },
    { name: "Matt Harpring", pick: 15, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 60, defense: 60, ovr: 73 },
    { name: "Ricky Davis", pick: 21, pos: ["G"], scoring: 72, playmaking: 48, rebounding: 45, defense: 48, ovr: 68 },
    { name: "Nazr Mohammed", pick: 29, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 68, defense: 62, ovr: 60 },
    { name: "Rashard Lewis", pick: 32, pos: ["F"], scoring: 82, playmaking: 50, rebounding: 62, defense: 58, ovr: 82 },
  ]},
  { year: 1999, players: [
    { name: "Elton Brand", pick: 1, pos: ["F", "C"], scoring: 82, playmaking: 50, rebounding: 84, defense: 72, ovr: 82 },
    { name: "Steve Francis", pick: 2, pos: ["G"], scoring: 84, playmaking: 72, rebounding: 52, defense: 58, ovr: 82 },
    { name: "Baron Davis", pick: 3, pos: ["G"], scoring: 82, playmaking: 82, rebounding: 48, defense: 70, ovr: 82 },
    { name: "Lamar Odom", pick: 4, pos: ["F"], scoring: 80, playmaking: 72, rebounding: 72, defense: 62, ovr: 80 },
    { name: "Jonathan Bender", pick: 5, pos: ["F", "C"], scoring: 62, playmaking: 40, rebounding: 58, defense: 58, ovr: 62 },
    { name: "Wally Szczerbiak", pick: 6, pos: ["F"], scoring: 78, playmaking: 48, rebounding: 48, defense: 45, ovr: 74 },
    { name: "Richard Hamilton", pick: 7, pos: ["G"], scoring: 82, playmaking: 58, rebounding: 42, defense: 58, ovr: 80 },
    { name: "Andre Miller", pick: 8, pos: ["G"], scoring: 76, playmaking: 85, rebounding: 50, defense: 60, ovr: 78 },
    { name: "Shawn Marion", pick: 9, pos: ["F"], scoring: 82, playmaking: 55, rebounding: 80, defense: 80, ovr: 84 },
    { name: "Jason Terry", pick: 10, pos: ["G"], scoring: 80, playmaking: 68, rebounding: 40, defense: 55, ovr: 78 },
    { name: "Trajan Langdon", pick: 11, pos: ["G"], scoring: 64, playmaking: 48, rebounding: 40, defense: 50, ovr: 62 },
    { name: "Corey Maggette", pick: 13, pos: ["F"], scoring: 78, playmaking: 45, rebounding: 58, defense: 50, ovr: 74 },
    { name: "William Avery", pick: 14, pos: ["G"], scoring: 58, playmaking: 58, rebounding: 38, defense: 50, ovr: 58 },
    { name: "Ron Artest", pick: 16, pos: ["F"], scoring: 76, playmaking: 55, rebounding: 60, defense: 92, ovr: 82 },
    { name: "James Posey", pick: 18, pos: ["F"], scoring: 70, playmaking: 48, rebounding: 55, defense: 78, ovr: 72 },
    { name: "Jeff Foster", pick: 21, pos: ["C"], scoring: 48, playmaking: 30, rebounding: 76, defense: 72, ovr: 62 },
    { name: "Jumaine Jones", pick: 27, pos: ["F"], scoring: 60, playmaking: 42, rebounding: 55, defense: 52, ovr: 60 },
    { name: "Manu Ginobili", pick: 57, pos: ["G"], scoring: 86, playmaking: 72, rebounding: 50, defense: 78, ovr: 88 },
  ]},
  { year: 2000, players: [
    { name: "Kenyon Martin", pick: 1, pos: ["F"], scoring: 74, playmaking: 45, rebounding: 72, defense: 78, ovr: 76 },
    { name: "Stromile Swift", pick: 2, pos: ["F", "C"], scoring: 66, playmaking: 40, rebounding: 68, defense: 60, ovr: 64 },
    { name: "Darius Miles", pick: 3, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 58, defense: 58, ovr: 64 },
    { name: "Marcus Fizer", pick: 4, pos: ["F"], scoring: 70, playmaking: 45, rebounding: 60, defense: 50, ovr: 66 },
    { name: "Mike Miller", pick: 5, pos: ["G", "F"], scoring: 76, playmaking: 55, rebounding: 52, defense: 50, ovr: 74 },
    { name: "DerMarr Johnson", pick: 6, pos: ["G", "F"], scoring: 64, playmaking: 45, rebounding: 48, defense: 55, ovr: 62 },
    { name: "Chris Mihm", pick: 7, pos: ["C"], scoring: 60, playmaking: 38, rebounding: 66, defense: 58, ovr: 60 },
    { name: "Jamal Crawford", pick: 8, pos: ["G"], scoring: 80, playmaking: 68, rebounding: 40, defense: 48, ovr: 76 },
    { name: "Joel Przybilla", pick: 9, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 70, defense: 74, ovr: 62 },
    { name: "Keyon Dooling", pick: 10, pos: ["G"], scoring: 64, playmaking: 58, rebounding: 40, defense: 58, ovr: 62 },
    { name: "Jerome Moiso", pick: 11, pos: ["F", "C"], scoring: 50, playmaking: 32, rebounding: 66, defense: 62, ovr: 58 },
    { name: "Etan Thomas", pick: 12, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 66, defense: 66, ovr: 60 },
    { name: "Hedo Turkoglu", pick: 16, pos: ["F"], scoring: 76, playmaking: 58, rebounding: 55, defense: 52, ovr: 74 },
    { name: "Quentin Richardson", pick: 18, pos: ["G", "F"], scoring: 72, playmaking: 45, rebounding: 58, defense: 55, ovr: 70 },
    { name: "Jamaal Magloire", pick: 19, pos: ["C"], scoring: 62, playmaking: 35, rebounding: 76, defense: 68, ovr: 66 },
    { name: "Morris Peterson", pick: 21, pos: ["G", "F"], scoring: 72, playmaking: 48, rebounding: 48, defense: 60, ovr: 70 },
    { name: "Marc Jackson", pick: 38, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 68, defense: 58, ovr: 62 },
    { name: "Michael Redd", pick: 43, pos: ["G"], scoring: 82, playmaking: 48, rebounding: 45, defense: 50, ovr: 78 },
  ]},
  { year: 2001, players: [
    { name: "Kwame Brown", pick: 1, pos: ["C"], scoring: 55, playmaking: 30, rebounding: 68, defense: 62, ovr: 63 },
    { name: "Tyson Chandler", pick: 2, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 88, defense: 88, ovr: 82 },
    { name: "Pau Gasol", pick: 3, pos: ["F","C"], scoring: 84, playmaking: 68, rebounding: 82, defense: 70, ovr: 90 },
    { name: "Eddy Curry", pick: 4, pos: ["C"], scoring: 76, playmaking: 35, rebounding: 68, defense: 58, ovr: 72 },
    { name: "Jason Richardson", pick: 5, pos: ["G"], scoring: 82, playmaking: 48, rebounding: 55, defense: 62, ovr: 81 },
    { name: "Shane Battier", pick: 6, pos: ["F"], scoring: 68, playmaking: 50, rebounding: 62, defense: 90, ovr: 78 },
    { name: "Eddie Griffin", pick: 7, pos: ["F", "C"], scoring: 60, playmaking: 40, rebounding: 66, defense: 68, ovr: 62 },
    { name: "DeSagana Diop", pick: 8, pos: ["C"], scoring: 40, playmaking: 25, rebounding: 70, defense: 75, ovr: 60 },
    { name: "Joe Johnson", pick: 10, pos: ["G","F"], scoring: 82, playmaking: 65, rebounding: 48, defense: 60, ovr: 84 },
    { name: "Vladimir Radmanovic", pick: 12, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 52, defense: 50, ovr: 64 },
    { name: "Richard Jefferson", pick: 13, pos: ["F"], scoring: 74, playmaking: 48, rebounding: 52, defense: 58, ovr: 72 },
    { name: "Troy Murphy", pick: 14, pos: ["F", "C"], scoring: 70, playmaking: 45, rebounding: 74, defense: 50, ovr: 70 },
    { name: "Zach Randolph", pick: 19, pos: ["F"], scoring: 84, playmaking: 50, rebounding: 84, defense: 55, ovr: 84 },
    { name: "Brendan Haywood", pick: 20, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 68, defense: 68, ovr: 62 },
    { name: "Gerald Wallace", pick: 25, pos: ["F"], scoring: 74, playmaking: 48, rebounding: 62, defense: 78, ovr: 76 },
    { name: "Jamaal Tinsley", pick: 27, pos: ["G"], scoring: 66, playmaking: 74, rebounding: 42, defense: 55, ovr: 66 },
    { name: "Tony Parker", pick: 28, pos: ["G"], scoring: 84, playmaking: 82, rebounding: 42, defense: 58, ovr: 86 },
    { name: "Gilbert Arenas", pick: 31, pos: ["G"], scoring: 88, playmaking: 75, rebounding: 42, defense: 60, ovr: 88 },
    { name: "Mehmet Okur", pick: 38, pos: ["C"], scoring: 74, playmaking: 45, rebounding: 68, defense: 50, ovr: 72 },
  ]},
  { year: 2002, players: [
    { name: "Yao Ming", pick: 1, pos: ["C"], scoring: 82, playmaking: 50, rebounding: 80, defense: 72, ovr: 84 },
    { name: "Jay Williams", pick: 2, pos: ["G"], scoring: 72, playmaking: 72, rebounding: 42, defense: 55, ovr: 70 },
    { name: "Mike Dunleavy", pick: 3, pos: ["F"], scoring: 72, playmaking: 52, rebounding: 55, defense: 52, ovr: 70 },
    { name: "Drew Gooden", pick: 4, pos: ["F", "C"], scoring: 72, playmaking: 45, rebounding: 72, defense: 55, ovr: 70 },
    { name: "Nikoloz Tskitishvili", pick: 5, pos: ["F"], scoring: 48, playmaking: 35, rebounding: 52, defense: 48, ovr: 52 },
    { name: "Dajuan Wagner", pick: 6, pos: ["G"], scoring: 68, playmaking: 52, rebounding: 38, defense: 48, ovr: 64 },
    { name: "Nene", pick: 7, pos: ["C"], scoring: 72, playmaking: 42, rebounding: 72, defense: 66, ovr: 72 },
    { name: "Chris Wilcox", pick: 8, pos: ["F", "C"], scoring: 66, playmaking: 40, rebounding: 64, defense: 55, ovr: 64 },
    { name: "Amar'e Stoudemire", pick: 9, pos: ["F", "C"], scoring: 86, playmaking: 45, rebounding: 72, defense: 58, ovr: 84 },
    { name: "Caron Butler", pick: 10, pos: ["F"], scoring: 80, playmaking: 55, rebounding: 58, defense: 60, ovr: 78 },
    { name: "Jared Jeffries", pick: 11, pos: ["F"], scoring: 58, playmaking: 45, rebounding: 55, defense: 68, ovr: 62 },
    { name: "Melvin Ely", pick: 12, pos: ["C"], scoring: 58, playmaking: 38, rebounding: 64, defense: 58, ovr: 60 },
    { name: "Marcus Haislip", pick: 13, pos: ["F"], scoring: 56, playmaking: 38, rebounding: 56, defense: 55, ovr: 56 },
    { name: "Kareem Rush", pick: 20, pos: ["G"], scoring: 66, playmaking: 45, rebounding: 40, defense: 52, ovr: 64 },
    { name: "Tayshaun Prince", pick: 23, pos: ["F"], scoring: 72, playmaking: 52, rebounding: 55, defense: 82, ovr: 76 },
    { name: "John Salmons", pick: 26, pos: ["G", "F"], scoring: 70, playmaking: 52, rebounding: 45, defense: 58, ovr: 68 },
    { name: "Carlos Boozer", pick: 35, pos: ["F"], scoring: 82, playmaking: 52, rebounding: 82, defense: 55, ovr: 80 },
  ]},
  { year: 2003, players: [
    { name: "LeBron James", pick: 1, pos: ["F","G"], scoring: 96, playmaking: 92, rebounding: 78, defense: 82, ovr: 99 },
    { name: "Darko Milicic", pick: 2, pos: ["C"], scoring: 52, playmaking: 38, rebounding: 60, defense: 60, ovr: 56 },
    { name: "Carmelo Anthony", pick: 3, pos: ["F"], scoring: 93, playmaking: 55, rebounding: 65, defense: 55, ovr: 91 },
    { name: "Chris Bosh", pick: 4, pos: ["F","C"], scoring: 82, playmaking: 55, rebounding: 82, defense: 72, ovr: 87 },
    { name: "Dwyane Wade", pick: 5, pos: ["G"], scoring: 92, playmaking: 78, rebounding: 55, defense: 82, ovr: 95 },
    { name: "Chris Kaman", pick: 6, pos: ["C"], scoring: 72, playmaking: 42, rebounding: 78, defense: 68, ovr: 76 },
    { name: "Kirk Hinrich", pick: 7, pos: ["G"], scoring: 70, playmaking: 72, rebounding: 40, defense: 78, ovr: 76 },
    { name: "T.J. Ford", pick: 8, pos: ["G"], scoring: 68, playmaking: 76, rebounding: 40, defense: 55, ovr: 68 },
    { name: "Nick Collison", pick: 12, pos: ["F", "C"], scoring: 58, playmaking: 42, rebounding: 66, defense: 62, ovr: 62 },
    { name: "Luke Ridnour", pick: 14, pos: ["G"], scoring: 66, playmaking: 68, rebounding: 40, defense: 52, ovr: 64 },
    { name: "David West", pick: 18, pos: ["F"], scoring: 80, playmaking: 55, rebounding: 76, defense: 68, ovr: 82 },
    { name: "Boris Diaw", pick: 21, pos: ["F","C"], scoring: 70, playmaking: 72, rebounding: 62, defense: 65, ovr: 74 },
    { name: "Kendrick Perkins", pick: 27, pos: ["C"], scoring: 48, playmaking: 35, rebounding: 72, defense: 80, ovr: 70 },
    { name: "Leandro Barbosa", pick: 28, pos: ["G"], scoring: 74, playmaking: 55, rebounding: 42, defense: 50, ovr: 70 },
    { name: "Josh Howard", pick: 29, pos: ["F"], scoring: 76, playmaking: 48, rebounding: 60, defense: 72, ovr: 78 },
    { name: "Jason Kapono", pick: 31, pos: ["F"], scoring: 66, playmaking: 40, rebounding: 42, defense: 45, ovr: 62 },
    { name: "Zaza Pachulia", pick: 42, pos: ["C"], scoring: 58, playmaking: 42, rebounding: 66, defense: 55, ovr: 60 },
    { name: "Mo Williams", pick: 47, pos: ["G"], scoring: 76, playmaking: 68, rebounding: 42, defense: 50, ovr: 74 },
    { name: "Kyle Korver", pick: 49, pos: ["F"], scoring: 74, playmaking: 42, rebounding: 45, defense: 55, ovr: 76 },
  ]},
  { year: 2004, players: [
    { name: "Dwight Howard", pick: 1, pos: ["C"], scoring: 80, playmaking: 45, rebounding: 92, defense: 92, ovr: 88 },
    { name: "Emeka Okafor", pick: 2, pos: ["C"], scoring: 66, playmaking: 40, rebounding: 80, defense: 80, ovr: 72 },
    { name: "Ben Gordon", pick: 3, pos: ["G"], scoring: 80, playmaking: 55, rebounding: 40, defense: 50, ovr: 76 },
    { name: "Shaun Livingston", pick: 4, pos: ["G"], scoring: 66, playmaking: 72, rebounding: 45, defense: 62, ovr: 68 },
    { name: "Devin Harris", pick: 5, pos: ["G"], scoring: 76, playmaking: 72, rebounding: 42, defense: 60, ovr: 74 },
    { name: "Josh Childress", pick: 6, pos: ["F"], scoring: 66, playmaking: 48, rebounding: 55, defense: 60, ovr: 66 },
    { name: "Luol Deng", pick: 7, pos: ["F"], scoring: 78, playmaking: 52, rebounding: 62, defense: 68, ovr: 76 },
    { name: "Rafael Araujo", pick: 8, pos: ["C"], scoring: 48, playmaking: 32, rebounding: 62, defense: 55, ovr: 54 },
    { name: "Andre Iguodala", pick: 9, pos: ["G", "F"], scoring: 78, playmaking: 68, rebounding: 62, defense: 82, ovr: 82 },
    { name: "Luke Jackson", pick: 10, pos: ["G", "F"], scoring: 56, playmaking: 45, rebounding: 45, defense: 50, ovr: 56 },
    { name: "Andris Biedrins", pick: 11, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 72, defense: 62, ovr: 62 },
    { name: "Sebastian Telfair", pick: 13, pos: ["G"], scoring: 62, playmaking: 62, rebounding: 36, defense: 50, ovr: 60 },
    { name: "Al Jefferson", pick: 15, pos: ["F", "C"], scoring: 80, playmaking: 45, rebounding: 82, defense: 58, ovr: 78 },
    { name: "Kirk Snyder", pick: 16, pos: ["G"], scoring: 60, playmaking: 45, rebounding: 45, defense: 55, ovr: 58 },
    { name: "Josh Smith", pick: 17, pos: ["F"], scoring: 78, playmaking: 55, rebounding: 72, defense: 85, ovr: 80 },
    { name: "Jameer Nelson", pick: 20, pos: ["G"], scoring: 74, playmaking: 72, rebounding: 42, defense: 55, ovr: 72 },
    { name: "Delonte West", pick: 24, pos: ["G"], scoring: 68, playmaking: 58, rebounding: 45, defense: 68, ovr: 68 },
    { name: "Kevin Martin", pick: 26, pos: ["G"], scoring: 82, playmaking: 48, rebounding: 42, defense: 48, ovr: 78 },
    { name: "Trevor Ariza", pick: 43, pos: ["F"], scoring: 68, playmaking: 48, rebounding: 55, defense: 72, ovr: 70 },
  ]},
  { year: 2005, players: [
    { name: "Andrew Bogut", pick: 1, pos: ["C"], scoring: 72, playmaking: 55, rebounding: 78, defense: 80, ovr: 76 },
    { name: "Marvin Williams", pick: 2, pos: ["F"], scoring: 70, playmaking: 45, rebounding: 60, defense: 58, ovr: 68 },
    { name: "Deron Williams", pick: 3, pos: ["G"], scoring: 82, playmaking: 85, rebounding: 48, defense: 62, ovr: 84 },
    { name: "Chris Paul", pick: 4, pos: ["G"], scoring: 88, playmaking: 95, rebounding: 52, defense: 80, ovr: 92 },
    { name: "Raymond Felton", pick: 5, pos: ["G"], scoring: 70, playmaking: 68, rebounding: 42, defense: 58, ovr: 68 },
    { name: "Charlie Villanueva", pick: 7, pos: ["F", "C"], scoring: 72, playmaking: 45, rebounding: 66, defense: 50, ovr: 70 },
    { name: "Channing Frye", pick: 8, pos: ["F", "C"], scoring: 70, playmaking: 42, rebounding: 62, defense: 55, ovr: 68 },
    { name: "Ike Diogu", pick: 9, pos: ["F", "C"], scoring: 62, playmaking: 38, rebounding: 64, defense: 52, ovr: 60 },
    { name: "Andrew Bynum", pick: 10, pos: ["C"], scoring: 76, playmaking: 42, rebounding: 78, defense: 68, ovr: 76 },
    { name: "Sean May", pick: 13, pos: ["F", "C"], scoring: 58, playmaking: 40, rebounding: 64, defense: 52, ovr: 58 },
    { name: "Rashad McCants", pick: 14, pos: ["G"], scoring: 68, playmaking: 48, rebounding: 42, defense: 48, ovr: 64 },
    { name: "Antoine Wright", pick: 15, pos: ["G", "F"], scoring: 58, playmaking: 45, rebounding: 45, defense: 58, ovr: 58 },
    { name: "Danny Granger", pick: 17, pos: ["F"], scoring: 80, playmaking: 50, rebounding: 58, defense: 58, ovr: 76 },
    { name: "Nate Robinson", pick: 21, pos: ["G"], scoring: 72, playmaking: 58, rebounding: 40, defense: 52, ovr: 68 },
    { name: "Jarrett Jack", pick: 22, pos: ["G"], scoring: 68, playmaking: 66, rebounding: 42, defense: 58, ovr: 68 },
    { name: "David Lee", pick: 30, pos: ["F", "C"], scoring: 74, playmaking: 50, rebounding: 80, defense: 52, ovr: 74 },
    { name: "Monta Ellis", pick: 40, pos: ["G"], scoring: 80, playmaking: 58, rebounding: 42, defense: 52, ovr: 76 },
    { name: "Lou Williams", pick: 45, pos: ["G"], scoring: 78, playmaking: 60, rebounding: 40, defense: 48, ovr: 74 },
  ]},
  { year: 2006, players: [
    { name: "Andrea Bargnani", pick: 1, pos: ["F", "C"], scoring: 72, playmaking: 42, rebounding: 52, defense: 45, ovr: 66 },
    { name: "LaMarcus Aldridge", pick: 2, pos: ["F", "C"], scoring: 84, playmaking: 50, rebounding: 78, defense: 68, ovr: 84 },
    { name: "Adam Morrison", pick: 3, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 45, defense: 45, ovr: 62 },
    { name: "Tyrus Thomas", pick: 4, pos: ["F"], scoring: 58, playmaking: 40, rebounding: 62, defense: 68, ovr: 62 },
    { name: "Shelden Williams", pick: 5, pos: ["F", "C"], scoring: 55, playmaking: 38, rebounding: 64, defense: 60, ovr: 58 },
    { name: "Brandon Roy", pick: 6, pos: ["G"], scoring: 84, playmaking: 68, rebounding: 55, defense: 62, ovr: 82 },
    { name: "Randy Foye", pick: 7, pos: ["G"], scoring: 70, playmaking: 58, rebounding: 42, defense: 52, ovr: 68 },
    { name: "Rudy Gay", pick: 8, pos: ["F"], scoring: 80, playmaking: 48, rebounding: 58, defense: 58, ovr: 76 },
    { name: "Patrick O'Bryant", pick: 9, pos: ["C"], scoring: 45, playmaking: 30, rebounding: 58, defense: 55, ovr: 52 },
    { name: "Mouhamed Sene", pick: 10, pos: ["C"], scoring: 45, playmaking: 28, rebounding: 58, defense: 62, ovr: 52 },
    { name: "J.J. Redick", pick: 11, pos: ["G"], scoring: 76, playmaking: 48, rebounding: 40, defense: 48, ovr: 72 },
    { name: "Thabo Sefolosha", pick: 13, pos: ["G", "F"], scoring: 60, playmaking: 45, rebounding: 50, defense: 78, ovr: 66 },
    { name: "Ronnie Brewer", pick: 14, pos: ["G"], scoring: 66, playmaking: 50, rebounding: 48, defense: 68, ovr: 66 },
    { name: "Rajon Rondo", pick: 21, pos: ["G"], scoring: 72, playmaking: 90, rebounding: 52, defense: 80, ovr: 82 },
    { name: "Marcus Williams", pick: 22, pos: ["G"], scoring: 60, playmaking: 66, rebounding: 38, defense: 52, ovr: 60 },
    { name: "Kyle Lowry", pick: 24, pos: ["G"], scoring: 78, playmaking: 80, rebounding: 55, defense: 78, ovr: 82 },
    { name: "Paul Millsap", pick: 47, pos: ["F", "C"], scoring: 78, playmaking: 52, rebounding: 78, defense: 72, ovr: 80 },
  ]},
  { year: 2007, players: [
    { name: "Greg Oden", pick: 1, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 72, defense: 78, ovr: 66 },
    { name: "Kevin Durant", pick: 2, pos: ["F"], scoring: 96, playmaking: 60, rebounding: 62, defense: 60, ovr: 95 },
    { name: "Al Horford", pick: 3, pos: ["F", "C"], scoring: 80, playmaking: 60, rebounding: 80, defense: 78, ovr: 84 },
    { name: "Mike Conley", pick: 4, pos: ["G"], scoring: 80, playmaking: 80, rebounding: 42, defense: 68, ovr: 82 },
    { name: "Jeff Green", pick: 5, pos: ["F"], scoring: 72, playmaking: 48, rebounding: 52, defense: 55, ovr: 68 },
    { name: "Yi Jianlian", pick: 6, pos: ["F", "C"], scoring: 62, playmaking: 40, rebounding: 62, defense: 52, ovr: 60 },
    { name: "Corey Brewer", pick: 7, pos: ["G", "F"], scoring: 64, playmaking: 48, rebounding: 48, defense: 72, ovr: 66 },
    { name: "Brandan Wright", pick: 8, pos: ["F", "C"], scoring: 62, playmaking: 38, rebounding: 64, defense: 62, ovr: 64 },
    { name: "Joakim Noah", pick: 9, pos: ["C"], scoring: 62, playmaking: 55, rebounding: 82, defense: 88, ovr: 80 },
    { name: "Spencer Hawes", pick: 10, pos: ["C"], scoring: 66, playmaking: 52, rebounding: 66, defense: 52, ovr: 66 },
    { name: "Acie Law", pick: 11, pos: ["G"], scoring: 58, playmaking: 58, rebounding: 38, defense: 52, ovr: 58 },
    { name: "Thaddeus Young", pick: 12, pos: ["F"], scoring: 74, playmaking: 50, rebounding: 62, defense: 68, ovr: 72 },
    { name: "Julian Wright", pick: 13, pos: ["F"], scoring: 58, playmaking: 48, rebounding: 52, defense: 62, ovr: 60 },
    { name: "Rodney Stuckey", pick: 15, pos: ["G"], scoring: 72, playmaking: 58, rebounding: 42, defense: 55, ovr: 68 },
    { name: "Nick Young", pick: 16, pos: ["G"], scoring: 72, playmaking: 42, rebounding: 40, defense: 45, ovr: 68 },
    { name: "Jared Dudley", pick: 22, pos: ["F"], scoring: 66, playmaking: 48, rebounding: 50, defense: 60, ovr: 66 },
    { name: "Wilson Chandler", pick: 23, pos: ["F"], scoring: 70, playmaking: 48, rebounding: 58, defense: 58, ovr: 68 },
    { name: "Aaron Brooks", pick: 26, pos: ["G"], scoring: 70, playmaking: 62, rebounding: 36, defense: 50, ovr: 66 },
    { name: "Arron Afflalo", pick: 27, pos: ["G"], scoring: 72, playmaking: 48, rebounding: 45, defense: 62, ovr: 70 },
    { name: "Marc Gasol", pick: 48, pos: ["C"], scoring: 78, playmaking: 62, rebounding: 78, defense: 85, ovr: 84 },
  ]},
  { year: 2008, players: [
    { name: "Derrick Rose", pick: 1, pos: ["G"], scoring: 85, playmaking: 78, rebounding: 45, defense: 52, ovr: 86 },
    { name: "Michael Beasley", pick: 2, pos: ["F"], scoring: 76, playmaking: 45, rebounding: 62, defense: 45, ovr: 72 },
    { name: "O.J. Mayo", pick: 3, pos: ["G"], scoring: 74, playmaking: 55, rebounding: 45, defense: 52, ovr: 70 },
    { name: "Russell Westbrook", pick: 4, pos: ["G"], scoring: 88, playmaking: 80, rebounding: 72, defense: 60, ovr: 90 },
    { name: "Kevin Love", pick: 5, pos: ["F", "C"], scoring: 82, playmaking: 58, rebounding: 88, defense: 52, ovr: 84 },
    { name: "Danilo Gallinari", pick: 6, pos: ["F"], scoring: 80, playmaking: 48, rebounding: 55, defense: 50, ovr: 76 },
    { name: "Eric Gordon", pick: 7, pos: ["G"], scoring: 78, playmaking: 55, rebounding: 42, defense: 55, ovr: 74 },
    { name: "Brook Lopez", pick: 10, pos: ["C"], scoring: 78, playmaking: 42, rebounding: 68, defense: 80, ovr: 78 },
    { name: "Jerryd Bayless", pick: 11, pos: ["G"], scoring: 66, playmaking: 58, rebounding: 40, defense: 52, ovr: 64 },
    { name: "Jason Thompson", pick: 12, pos: ["F", "C"], scoring: 62, playmaking: 42, rebounding: 68, defense: 58, ovr: 64 },
    { name: "Anthony Randolph", pick: 14, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 60, defense: 58, ovr: 60 },
    { name: "Robin Lopez", pick: 15, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 64, defense: 72, ovr: 66 },
    { name: "Marreese Speights", pick: 16, pos: ["F", "C"], scoring: 64, playmaking: 40, rebounding: 60, defense: 50, ovr: 62 },
    { name: "Roy Hibbert", pick: 17, pos: ["C"], scoring: 66, playmaking: 40, rebounding: 72, defense: 82, ovr: 70 },
    { name: "JaVale McGee", pick: 18, pos: ["C"], scoring: 62, playmaking: 35, rebounding: 68, defense: 72, ovr: 66 },
    { name: "Ryan Anderson", pick: 21, pos: ["F"], scoring: 74, playmaking: 42, rebounding: 66, defense: 45, ovr: 72 },
    { name: "Courtney Lee", pick: 22, pos: ["G"], scoring: 66, playmaking: 48, rebounding: 42, defense: 68, ovr: 66 },
    { name: "Serge Ibaka", pick: 24, pos: ["F", "C"], scoring: 72, playmaking: 40, rebounding: 72, defense: 88, ovr: 78 },
    { name: "Nicolas Batum", pick: 25, pos: ["F"], scoring: 74, playmaking: 55, rebounding: 58, defense: 72, ovr: 74 },
    { name: "George Hill", pick: 26, pos: ["G"], scoring: 72, playmaking: 62, rebounding: 45, defense: 68, ovr: 70 },
    { name: "DeAndre Jordan", pick: 35, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 88, defense: 82, ovr: 76 },
  ]},
  { year: 2009, players: [
    { name: "Blake Griffin", pick: 1, pos: ["F"], scoring: 86, playmaking: 62, rebounding: 82, defense: 62, ovr: 87 },
    { name: "Hasheem Thabeet", pick: 2, pos: ["C"], scoring: 45, playmaking: 25, rebounding: 65, defense: 72, ovr: 58 },
    { name: "James Harden", pick: 3, pos: ["G"], scoring: 94, playmaking: 85, rebounding: 48, defense: 55, ovr: 96 },
    { name: "Tyreke Evans", pick: 4, pos: ["G"], scoring: 78, playmaking: 62, rebounding: 52, defense: 55, ovr: 76 },
    { name: "Ricky Rubio", pick: 5, pos: ["G"], scoring: 62, playmaking: 80, rebounding: 45, defense: 72, ovr: 68 },
    { name: "Stephen Curry", pick: 7, pos: ["G"], scoring: 96, playmaking: 88, rebounding: 42, defense: 58, ovr: 97 },
    { name: "Jordan Hill", pick: 8, pos: ["F", "C"], scoring: 62, playmaking: 40, rebounding: 66, defense: 58, ovr: 62 },
    { name: "DeMar DeRozan", pick: 9, pos: ["G","F"], scoring: 86, playmaking: 55, rebounding: 48, defense: 58, ovr: 85 },
    { name: "Brandon Jennings", pick: 10, pos: ["G"], scoring: 74, playmaking: 68, rebounding: 40, defense: 52, ovr: 72 },
    { name: "Gerald Henderson", pick: 12, pos: ["G"], scoring: 68, playmaking: 48, rebounding: 48, defense: 58, ovr: 66 },
    { name: "Jrue Holiday", pick: 17, pos: ["G"], scoring: 78, playmaking: 78, rebounding: 48, defense: 88, ovr: 86 },
    { name: "Ty Lawson", pick: 18, pos: ["G"], scoring: 75, playmaking: 80, rebounding: 32, defense: 55, ovr: 78 },
    { name: "Jeff Teague", pick: 19, pos: ["G"], scoring: 74, playmaking: 68, rebounding: 42, defense: 60, ovr: 72 },
    { name: "Darren Collison", pick: 21, pos: ["G"], scoring: 70, playmaking: 66, rebounding: 40, defense: 55, ovr: 68 },
    { name: "Omri Casspi", pick: 23, pos: ["F"], scoring: 68, playmaking: 42, rebounding: 55, defense: 55, ovr: 68 },
    { name: "Taj Gibson", pick: 26, pos: ["F","C"], scoring: 64, playmaking: 38, rebounding: 74, defense: 78, ovr: 74 },
    { name: "DeJuan Blair", pick: 37, pos: ["F","C"], scoring: 55, playmaking: 30, rebounding: 75, defense: 55, ovr: 68 },
    { name: "Marcus Thornton", pick: 43, pos: ["G"], scoring: 76, playmaking: 45, rebounding: 35, defense: 55, ovr: 72 },
  ]},
  { year: 2010, players: [
    { name: "John Wall", pick: 1, pos: ["G"], scoring: 82, playmaking: 85, rebounding: 45, defense: 68, ovr: 84 },
    { name: "Evan Turner", pick: 2, pos: ["G", "F"], scoring: 68, playmaking: 60, rebounding: 55, defense: 55, ovr: 68 },
    { name: "Derrick Favors", pick: 3, pos: ["F", "C"], scoring: 66, playmaking: 40, rebounding: 76, defense: 72, ovr: 70 },
    { name: "Wesley Johnson", pick: 4, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 52, defense: 55, ovr: 58 },
    { name: "DeMarcus Cousins", pick: 5, pos: ["C"], scoring: 85, playmaking: 55, rebounding: 85, defense: 62, ovr: 84 },
    { name: "Ekpe Udoh", pick: 6, pos: ["F", "C"], scoring: 52, playmaking: 38, rebounding: 62, defense: 72, ovr: 60 },
    { name: "Greg Monroe", pick: 7, pos: ["F", "C"], scoring: 74, playmaking: 58, rebounding: 80, defense: 55, ovr: 74 },
    { name: "Al-Farouq Aminu", pick: 8, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 66, defense: 72, ovr: 66 },
    { name: "Gordon Hayward", pick: 9, pos: ["F"], scoring: 78, playmaking: 60, rebounding: 55, defense: 58, ovr: 76 },
    { name: "Paul George", pick: 10, pos: ["F"], scoring: 86, playmaking: 55, rebounding: 62, defense: 80, ovr: 86 },
    { name: "Cole Aldrich", pick: 11, pos: ["C"], scoring: 52, playmaking: 32, rebounding: 66, defense: 64, ovr: 58 },
    { name: "Ed Davis", pick: 13, pos: ["F", "C"], scoring: 55, playmaking: 35, rebounding: 74, defense: 62, ovr: 62 },
    { name: "Patrick Patterson", pick: 14, pos: ["F"], scoring: 64, playmaking: 42, rebounding: 58, defense: 58, ovr: 64 },
    { name: "Larry Sanders", pick: 15, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 72, defense: 82, ovr: 68 },
    { name: "Eric Bledsoe", pick: 18, pos: ["G"], scoring: 76, playmaking: 68, rebounding: 48, defense: 80, ovr: 78 },
    { name: "Avery Bradley", pick: 19, pos: ["G"], scoring: 66, playmaking: 45, rebounding: 42, defense: 82, ovr: 70 },
    { name: "Greivis Vasquez", pick: 28, pos: ["G"], scoring: 66, playmaking: 66, rebounding: 42, defense: 50, ovr: 64 },
    { name: "Hassan Whiteside", pick: 33, pos: ["C"], scoring: 58, playmaking: 32, rebounding: 82, defense: 88, ovr: 74 },
    { name: "Landry Fields", pick: 39, pos: ["G", "F"], scoring: 62, playmaking: 48, rebounding: 55, defense: 58, ovr: 62 },
    { name: "Lance Stephenson", pick: 40, pos: ["G"], scoring: 70, playmaking: 58, rebounding: 55, defense: 60, ovr: 68 },
  ]},
  { year: 2011, players: [
    { name: "Kyrie Irving", pick: 1, pos: ["G"], scoring: 92, playmaking: 88, rebounding: 40, defense: 58, ovr: 90 },
    { name: "Enes Kanter", pick: 3, pos: ["C"], scoring: 68, playmaking: 35, rebounding: 80, defense: 45, ovr: 72 },
    { name: "Tristan Thompson", pick: 4, pos: ["F", "C"], scoring: 58, playmaking: 38, rebounding: 74, defense: 66, ovr: 66 },
    { name: "Jonas Valanciunas", pick: 5, pos: ["C"], scoring: 74, playmaking: 42, rebounding: 80, defense: 58, ovr: 74 },
    { name: "Bismack Biyombo", pick: 7, pos: ["C"], scoring: 35, playmaking: 25, rebounding: 75, defense: 82, ovr: 65 },
    { name: "Brandon Knight", pick: 8, pos: ["G"], scoring: 72, playmaking: 58, rebounding: 40, defense: 50, ovr: 68 },
    { name: "Kemba Walker", pick: 9, pos: ["G"], scoring: 84, playmaking: 75, rebounding: 35, defense: 55, ovr: 84 },
    { name: "Klay Thompson", pick: 11, pos: ["G"], scoring: 88, playmaking: 48, rebounding: 45, defense: 75, ovr: 88 },
    { name: "Alec Burks", pick: 12, pos: ["G"], scoring: 70, playmaking: 48, rebounding: 45, defense: 52, ovr: 66 },
    { name: "Markieff Morris", pick: 13, pos: ["F"], scoring: 68, playmaking: 45, rebounding: 60, defense: 58, ovr: 66 },
    { name: "Marcus Morris", pick: 14, pos: ["F"], scoring: 70, playmaking: 45, rebounding: 52, defense: 55, ovr: 68 },
    { name: "Kawhi Leonard", pick: 15, pos: ["F"], scoring: 88, playmaking: 55, rebounding: 72, defense: 97, ovr: 96 },
    { name: "Nikola Vucevic", pick: 16, pos: ["C"], scoring: 78, playmaking: 55, rebounding: 88, defense: 62, ovr: 82 },
    { name: "Iman Shumpert", pick: 17, pos: ["G"], scoring: 60, playmaking: 45, rebounding: 45, defense: 78, ovr: 64 },
    { name: "Tobias Harris", pick: 19, pos: ["F"], scoring: 78, playmaking: 50, rebounding: 62, defense: 58, ovr: 79 },
    { name: "Nikola Mirotic", pick: 23, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 62, defense: 50, ovr: 70 },
    { name: "Reggie Jackson", pick: 24, pos: ["G"], scoring: 74, playmaking: 65, rebounding: 38, defense: 55, ovr: 74 },
    { name: "Jimmy Butler", pick: 30, pos: ["F","G"], scoring: 86, playmaking: 68, rebounding: 62, defense: 90, ovr: 93 },
    { name: "Chandler Parsons", pick: 38, pos: ["F"], scoring: 72, playmaking: 55, rebounding: 55, defense: 60, ovr: 74 },
    { name: "Isaiah Thomas", pick: 60, pos: ["G"], scoring: 84, playmaking: 68, rebounding: 32, defense: 45, ovr: 82 },
  ]},
  { year: 2012, players: [
    { name: "Anthony Davis", pick: 1, pos: ["F", "C"], scoring: 88, playmaking: 50, rebounding: 84, defense: 92, ovr: 90 },
    { name: "Michael Kidd-Gilchrist", pick: 2, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 58, defense: 72, ovr: 62 },
    { name: "Bradley Beal", pick: 3, pos: ["G"], scoring: 84, playmaking: 58, rebounding: 45, defense: 55, ovr: 80 },
    { name: "Dion Waiters", pick: 4, pos: ["G"], scoring: 74, playmaking: 50, rebounding: 40, defense: 50, ovr: 68 },
    { name: "Thomas Robinson", pick: 5, pos: ["F"], scoring: 55, playmaking: 38, rebounding: 66, defense: 55, ovr: 56 },
    { name: "Damian Lillard", pick: 6, pos: ["G"], scoring: 90, playmaking: 80, rebounding: 45, defense: 52, ovr: 88 },
    { name: "Harrison Barnes", pick: 7, pos: ["F"], scoring: 74, playmaking: 45, rebounding: 52, defense: 58, ovr: 70 },
    { name: "Andre Drummond", pick: 9, pos: ["C"], scoring: 62, playmaking: 35, rebounding: 92, defense: 68, ovr: 76 },
    { name: "Austin Rivers", pick: 10, pos: ["G"], scoring: 66, playmaking: 52, rebounding: 40, defense: 52, ovr: 64 },
    { name: "Meyers Leonard", pick: 11, pos: ["C"], scoring: 55, playmaking: 38, rebounding: 60, defense: 52, ovr: 58 },
    { name: "John Henson", pick: 14, pos: ["F", "C"], scoring: 58, playmaking: 38, rebounding: 66, defense: 72, ovr: 64 },
    { name: "Tyler Zeller", pick: 17, pos: ["C"], scoring: 62, playmaking: 40, rebounding: 64, defense: 55, ovr: 62 },
    { name: "Evan Fournier", pick: 20, pos: ["G"], scoring: 74, playmaking: 52, rebounding: 42, defense: 50, ovr: 72 },
    { name: "Jared Sullinger", pick: 21, pos: ["F", "C"], scoring: 66, playmaking: 45, rebounding: 72, defense: 50, ovr: 66 },
    { name: "Festus Ezeli", pick: 30, pos: ["C"], scoring: 50, playmaking: 30, rebounding: 64, defense: 68, ovr: 56 },
    { name: "Jae Crowder", pick: 34, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 55, defense: 72, ovr: 68 },
    { name: "Draymond Green", pick: 35, pos: ["F"], scoring: 62, playmaking: 72, rebounding: 72, defense: 92, ovr: 82 },
    { name: "Khris Middleton", pick: 39, pos: ["F"], scoring: 80, playmaking: 58, rebounding: 55, defense: 62, ovr: 80 },
  ]},
  { year: 2013, players: [
    { name: "Victor Oladipo", pick: 2, pos: ["G"], scoring: 82, playmaking: 55, rebounding: 48, defense: 82, ovr: 82 },
    { name: "Otto Porter Jr.", pick: 3, pos: ["F"], scoring: 68, playmaking: 42, rebounding: 55, defense: 68, ovr: 74 },
    { name: "Cody Zeller", pick: 4, pos: ["F", "C"], scoring: 62, playmaking: 42, rebounding: 64, defense: 55, ovr: 62 },
    { name: "Alex Len", pick: 5, pos: ["C"], scoring: 60, playmaking: 38, rebounding: 66, defense: 58, ovr: 60 },
    { name: "Nerlens Noel", pick: 6, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 66, defense: 80, ovr: 64 },
    { name: "Kentavious Caldwell-Pope", pick: 8, pos: ["G"], scoring: 70, playmaking: 42, rebounding: 42, defense: 78, ovr: 74 },
    { name: "Trey Burke", pick: 9, pos: ["G"], scoring: 72, playmaking: 70, rebounding: 30, defense: 50, ovr: 72 },
    { name: "C.J. McCollum", pick: 10, pos: ["G"], scoring: 84, playmaking: 55, rebounding: 38, defense: 55, ovr: 84 },
    { name: "Michael Carter-Williams", pick: 11, pos: ["G"], scoring: 62, playmaking: 66, rebounding: 48, defense: 62, ovr: 62 },
    { name: "Steven Adams", pick: 12, pos: ["C"], scoring: 62, playmaking: 40, rebounding: 84, defense: 78, ovr: 80 },
    { name: "Kelly Olynyk", pick: 13, pos: ["F", "C"], scoring: 70, playmaking: 52, rebounding: 58, defense: 48, ovr: 68 },
    { name: "Shabazz Muhammad", pick: 14, pos: ["F"], scoring: 62, playmaking: 38, rebounding: 45, defense: 45, ovr: 58 },
    { name: "Giannis Antetokounmpo", pick: 15, pos: ["F","C"], scoring: 92, playmaking: 65, rebounding: 92, defense: 92, ovr: 97 },
    { name: "Dennis Schroder", pick: 17, pos: ["G"], scoring: 76, playmaking: 72, rebounding: 32, defense: 58, ovr: 76 },
    { name: "Mason Plumlee", pick: 22, pos: ["C"], scoring: 60, playmaking: 45, rebounding: 78, defense: 65, ovr: 70 },
    { name: "Tim Hardaway Jr.", pick: 24, pos: ["G"], scoring: 72, playmaking: 45, rebounding: 42, defense: 48, ovr: 68 },
    { name: "Rudy Gobert", pick: 27, pos: ["C"], scoring: 62, playmaking: 35, rebounding: 92, defense: 96, ovr: 88 },
  ]},
  { year: 2014, players: [
    { name: "Andrew Wiggins", pick: 1, pos: ["F"], scoring: 78, playmaking: 48, rebounding: 52, defense: 60, ovr: 76 },
    { name: "Joel Embiid", pick: 3, pos: ["C"], scoring: 88, playmaking: 50, rebounding: 85, defense: 88, ovr: 90 },
    { name: "Aaron Gordon", pick: 4, pos: ["F"], scoring: 72, playmaking: 48, rebounding: 62, defense: 72, ovr: 72 },
    { name: "Dante Exum", pick: 5, pos: ["G"], scoring: 56, playmaking: 55, rebounding: 42, defense: 58, ovr: 56 },
    { name: "Marcus Smart", pick: 6, pos: ["G"], scoring: 66, playmaking: 62, rebounding: 48, defense: 88, ovr: 74 },
    { name: "Julius Randle", pick: 7, pos: ["F"], scoring: 80, playmaking: 58, rebounding: 78, defense: 52, ovr: 80 },
    { name: "Nik Stauskas", pick: 8, pos: ["G"], scoring: 62, playmaking: 48, rebounding: 38, defense: 45, ovr: 60 },
    { name: "Noah Vonleh", pick: 9, pos: ["F", "C"], scoring: 55, playmaking: 38, rebounding: 64, defense: 55, ovr: 56 },
    { name: "Elfrid Payton", pick: 10, pos: ["G"], scoring: 66, playmaking: 72, rebounding: 48, defense: 60, ovr: 66 },
    { name: "Doug McDermott", pick: 11, pos: ["F"], scoring: 70, playmaking: 42, rebounding: 45, defense: 42, ovr: 66 },
    { name: "Dario Saric", pick: 12, pos: ["F"], scoring: 70, playmaking: 52, rebounding: 62, defense: 48, ovr: 68 },
    { name: "Zach LaVine", pick: 13, pos: ["G"], scoring: 84, playmaking: 55, rebounding: 48, defense: 50, ovr: 80 },
    { name: "T.J. Warren", pick: 14, pos: ["F"], scoring: 74, playmaking: 42, rebounding: 48, defense: 48, ovr: 70 },
    { name: "Jusuf Nurkic", pick: 16, pos: ["C"], scoring: 72, playmaking: 55, rebounding: 78, defense: 66, ovr: 72 },
    { name: "Gary Harris", pick: 19, pos: ["G"], scoring: 68, playmaking: 48, rebounding: 42, defense: 70, ovr: 66 },
    { name: "Rodney Hood", pick: 23, pos: ["G", "F"], scoring: 70, playmaking: 45, rebounding: 42, defense: 50, ovr: 66 },
    { name: "Clint Capela", pick: 25, pos: ["C"], scoring: 66, playmaking: 35, rebounding: 82, defense: 78, ovr: 74 },
    { name: "Bogdan Bogdanovic", pick: 27, pos: ["G"], scoring: 76, playmaking: 55, rebounding: 45, defense: 52, ovr: 74 },
    { name: "Nikola Jokic", pick: 41, pos: ["C"], scoring: 88, playmaking: 88, rebounding: 88, defense: 68, ovr: 92 },
  ]},
  { year: 2015, players: [
    { name: "Karl-Anthony Towns", pick: 1, pos: ["C"], scoring: 90, playmaking: 58, rebounding: 88, defense: 62, ovr: 90 },
    { name: "D'Angelo Russell", pick: 2, pos: ["G"], scoring: 80, playmaking: 75, rebounding: 35, defense: 50, ovr: 80 },
    { name: "Jahlil Okafor", pick: 3, pos: ["C"], scoring: 72, playmaking: 42, rebounding: 68, defense: 50, ovr: 68 },
    { name: "Kristaps Porzingis", pick: 4, pos: ["F","C"], scoring: 84, playmaking: 45, rebounding: 72, defense: 78, ovr: 84 },
    { name: "Willie Cauley-Stein", pick: 6, pos: ["C"], scoring: 60, playmaking: 38, rebounding: 74, defense: 70, ovr: 68 },
    { name: "Emmanuel Mudiay", pick: 7, pos: ["G"], scoring: 62, playmaking: 60, rebounding: 42, defense: 50, ovr: 60 },
    { name: "Frank Kaminsky", pick: 9, pos: ["F", "C"], scoring: 68, playmaking: 48, rebounding: 58, defense: 45, ovr: 66 },
    { name: "Justise Winslow", pick: 10, pos: ["F"], scoring: 62, playmaking: 52, rebounding: 55, defense: 68, ovr: 64 },
    { name: "Myles Turner", pick: 11, pos: ["F","C"], scoring: 76, playmaking: 42, rebounding: 72, defense: 84, ovr: 80 },
    { name: "Devin Booker", pick: 13, pos: ["G"], scoring: 92, playmaking: 68, rebounding: 40, defense: 55, ovr: 91 },
    { name: "Kelly Oubre Jr.", pick: 15, pos: ["F"], scoring: 72, playmaking: 40, rebounding: 55, defense: 68, ovr: 74 },
    { name: "Terry Rozier", pick: 16, pos: ["G"], scoring: 72, playmaking: 55, rebounding: 48, defense: 55, ovr: 70 },
    { name: "Delon Wright", pick: 20, pos: ["G"], scoring: 64, playmaking: 60, rebounding: 45, defense: 68, ovr: 66 },
    { name: "Bobby Portis", pick: 22, pos: ["F", "C"], scoring: 72, playmaking: 42, rebounding: 68, defense: 52, ovr: 70 },
    { name: "Larry Nance Jr.", pick: 27, pos: ["F","C"], scoring: 65, playmaking: 45, rebounding: 72, defense: 72, ovr: 72 },
    { name: "Montrezl Harrell", pick: 32, pos: ["F","C"], scoring: 72, playmaking: 38, rebounding: 68, defense: 62, ovr: 74 },
    { name: "Josh Richardson", pick: 40, pos: ["G"], scoring: 68, playmaking: 50, rebounding: 45, defense: 68, ovr: 68 },
    { name: "Norman Powell", pick: 46, pos: ["G"], scoring: 74, playmaking: 42, rebounding: 40, defense: 65, ovr: 76 },
  ]},
  { year: 2016, players: [
    { name: "Ben Simmons", pick: 1, pos: ["G", "F"], scoring: 72, playmaking: 85, rebounding: 72, defense: 82, ovr: 80 },
    { name: "Brandon Ingram", pick: 2, pos: ["F"], scoring: 82, playmaking: 55, rebounding: 52, defense: 55, ovr: 78 },
    { name: "Jaylen Brown", pick: 3, pos: ["G", "F"], scoring: 84, playmaking: 52, rebounding: 58, defense: 72, ovr: 82 },
    { name: "Kris Dunn", pick: 5, pos: ["G"], scoring: 58, playmaking: 58, rebounding: 45, defense: 72, ovr: 60 },
    { name: "Buddy Hield", pick: 6, pos: ["G"], scoring: 78, playmaking: 48, rebounding: 45, defense: 50, ovr: 74 },
    { name: "Jamal Murray", pick: 7, pos: ["G"], scoring: 82, playmaking: 68, rebounding: 45, defense: 55, ovr: 80 },
    { name: "Marquese Chriss", pick: 8, pos: ["F", "C"], scoring: 58, playmaking: 38, rebounding: 60, defense: 55, ovr: 58 },
    { name: "Jakob Poeltl", pick: 9, pos: ["C"], scoring: 62, playmaking: 42, rebounding: 74, defense: 78, ovr: 72 },
    { name: "Thon Maker", pick: 10, pos: ["C"], scoring: 48, playmaking: 30, rebounding: 58, defense: 62, ovr: 54 },
    { name: "Domantas Sabonis", pick: 11, pos: ["F", "C"], scoring: 80, playmaking: 62, rebounding: 85, defense: 58, ovr: 80 },
    { name: "Taurean Prince", pick: 12, pos: ["F"], scoring: 66, playmaking: 45, rebounding: 52, defense: 58, ovr: 64 },
    { name: "Denzel Valentine", pick: 14, pos: ["G"], scoring: 60, playmaking: 55, rebounding: 48, defense: 48, ovr: 60 },
    { name: "Juan Hernangomez", pick: 15, pos: ["F"], scoring: 62, playmaking: 42, rebounding: 58, defense: 50, ovr: 60 },
    { name: "Wade Baldwin", pick: 17, pos: ["G"], scoring: 55, playmaking: 55, rebounding: 40, defense: 58, ovr: 56 },
    { name: "Pascal Siakam", pick: 27, pos: ["F"], scoring: 82, playmaking: 58, rebounding: 68, defense: 72, ovr: 82 },
    { name: "Dejounte Murray", pick: 29, pos: ["G"], scoring: 78, playmaking: 68, rebounding: 62, defense: 78, ovr: 78 },
    { name: "Ivica Zubac", pick: 32, pos: ["C"], scoring: 66, playmaking: 40, rebounding: 74, defense: 66, ovr: 68 },
    { name: "Malcolm Brogdon", pick: 36, pos: ["G"], scoring: 74, playmaking: 62, rebounding: 48, defense: 60, ovr: 72 },
  ]},
  { year: 2017, players: [
    { name: "Markelle Fultz", pick: 1, pos: ["G"], scoring: 62, playmaking: 60, rebounding: 45, defense: 55, ovr: 62 },
    { name: "Lonzo Ball", pick: 2, pos: ["G"], scoring: 66, playmaking: 80, rebounding: 62, defense: 78, ovr: 74 },
    { name: "Jayson Tatum", pick: 3, pos: ["F"], scoring: 90, playmaking: 58, rebounding: 68, defense: 72, ovr: 90 },
    { name: "Josh Jackson", pick: 4, pos: ["F"], scoring: 60, playmaking: 45, rebounding: 52, defense: 60, ovr: 60 },
    { name: "De'Aaron Fox", pick: 5, pos: ["G"], scoring: 84, playmaking: 78, rebounding: 45, defense: 68, ovr: 84 },
    { name: "Frank Ntilikina", pick: 8, pos: ["G"], scoring: 52, playmaking: 52, rebounding: 40, defense: 68, ovr: 56 },
    { name: "Dennis Smith Jr.", pick: 9, pos: ["G"], scoring: 62, playmaking: 58, rebounding: 42, defense: 50, ovr: 60 },
    { name: "Zach Collins", pick: 10, pos: ["F", "C"], scoring: 60, playmaking: 42, rebounding: 62, defense: 62, ovr: 62 },
    { name: "Malik Monk", pick: 11, pos: ["G"], scoring: 72, playmaking: 48, rebounding: 38, defense: 45, ovr: 68 },
    { name: "Luke Kennard", pick: 12, pos: ["G"], scoring: 70, playmaking: 48, rebounding: 40, defense: 45, ovr: 66 },
    { name: "Donovan Mitchell", pick: 13, pos: ["G"], scoring: 88, playmaking: 62, rebounding: 48, defense: 58, ovr: 86 },
    { name: "Bam Adebayo", pick: 14, pos: ["C"], scoring: 76, playmaking: 62, rebounding: 80, defense: 88, ovr: 84 },
    { name: "John Collins", pick: 19, pos: ["F", "C"], scoring: 76, playmaking: 45, rebounding: 72, defense: 58, ovr: 74 },
    { name: "Jarrett Allen", pick: 22, pos: ["C"], scoring: 72, playmaking: 40, rebounding: 80, defense: 78, ovr: 76 },
    { name: "OG Anunoby", pick: 23, pos: ["F"], scoring: 74, playmaking: 48, rebounding: 52, defense: 85, ovr: 78 },
    { name: "Kyle Kuzma", pick: 27, pos: ["F"], scoring: 74, playmaking: 45, rebounding: 55, defense: 48, ovr: 70 },
    { name: "Derrick White", pick: 29, pos: ["G"], scoring: 76, playmaking: 65, rebounding: 45, defense: 80, ovr: 78 },
  ]},
  { year: 2018, players: [
    { name: "Deandre Ayton", pick: 1, pos: ["C"], scoring: 78, playmaking: 42, rebounding: 84, defense: 62, ovr: 80 },
    { name: "Marvin Bagley III", pick: 2, pos: ["F", "C"], scoring: 72, playmaking: 42, rebounding: 68, defense: 50, ovr: 70 },
    { name: "Luka Doncic", pick: 3, pos: ["G","F"], scoring: 94, playmaking: 92, rebounding: 68, defense: 55, ovr: 96 },
    { name: "Jaren Jackson Jr.", pick: 4, pos: ["F","C"], scoring: 78, playmaking: 42, rebounding: 68, defense: 92, ovr: 85 },
    { name: "Trae Young", pick: 5, pos: ["G"], scoring: 88, playmaking: 92, rebounding: 32, defense: 45, ovr: 87 },
    { name: "Mo Bamba", pick: 6, pos: ["C"], scoring: 58, playmaking: 35, rebounding: 66, defense: 72, ovr: 62 },
    { name: "Wendell Carter Jr.", pick: 7, pos: ["C"], scoring: 68, playmaking: 45, rebounding: 74, defense: 68, ovr: 72 },
    { name: "Collin Sexton", pick: 8, pos: ["G"], scoring: 78, playmaking: 55, rebounding: 32, defense: 50, ovr: 76 },
    { name: "Kevin Knox", pick: 9, pos: ["F"], scoring: 60, playmaking: 40, rebounding: 45, defense: 45, ovr: 58 },
    { name: "Mikal Bridges", pick: 10, pos: ["F","G"], scoring: 74, playmaking: 48, rebounding: 52, defense: 88, ovr: 82 },
    { name: "Shai Gilgeous-Alexander", pick: 11, pos: ["G"], scoring: 92, playmaking: 78, rebounding: 45, defense: 78, ovr: 96 },
    { name: "Miles Bridges", pick: 12, pos: ["F"], scoring: 76, playmaking: 42, rebounding: 58, defense: 58, ovr: 76 },
    { name: "Michael Porter Jr.", pick: 14, pos: ["F"], scoring: 82, playmaking: 40, rebounding: 62, defense: 50, ovr: 80 },
    { name: "Donte DiVincenzo", pick: 17, pos: ["G"], scoring: 70, playmaking: 52, rebounding: 50, defense: 68, ovr: 70 },
    { name: "Lonnie Walker IV", pick: 18, pos: ["G"], scoring: 68, playmaking: 45, rebounding: 40, defense: 52, ovr: 64 },
    { name: "Kevin Huerter", pick: 19, pos: ["G"], scoring: 70, playmaking: 52, rebounding: 45, defense: 55, ovr: 68 },
    { name: "Robert Williams III", pick: 27, pos: ["C"], scoring: 62, playmaking: 38, rebounding: 72, defense: 82, ovr: 70 },
  ]},
  { year: 2019, players: [
    { name: "Zion Williamson", pick: 1, pos: ["F"], scoring: 88, playmaking: 55, rebounding: 78, defense: 58, ovr: 88, floor: 0.55 },
    { name: "Ja Morant", pick: 2, pos: ["G"], scoring: 88, playmaking: 90, rebounding: 42, defense: 58, ovr: 89, floor: 0.7 },
    { name: "RJ Barrett", pick: 3, pos: ["G","F"], scoring: 80, playmaking: 55, rebounding: 55, defense: 58, ovr: 79, floor: 0.75 },
    { name: "De'Andre Hunter", pick: 4, pos: ["F"], scoring: 70, playmaking: 42, rebounding: 48, defense: 68, ovr: 74, floor: 0.75 },
    { name: "Darius Garland", pick: 5, pos: ["G"], scoring: 80, playmaking: 78, rebounding: 32, defense: 50, ovr: 83, floor: 0.75 },
    { name: "Jarrett Culver", pick: 6, pos: ["G", "F"], scoring: 58, playmaking: 45, rebounding: 45, defense: 55, ovr: 58, floor: 0.7 },
    { name: "Coby White", pick: 7, pos: ["G"], scoring: 78, playmaking: 58, rebounding: 35, defense: 48, ovr: 78, floor: 0.75 },
    { name: "Jaxson Hayes", pick: 8, pos: ["C"], scoring: 55, playmaking: 30, rebounding: 60, defense: 62, ovr: 66, floor: 0.6 },
    { name: "Rui Hachimura", pick: 9, pos: ["F"], scoring: 72, playmaking: 40, rebounding: 52, defense: 55, ovr: 74, floor: 0.75 },
    { name: "Cam Reddish", pick: 10, pos: ["F"], scoring: 62, playmaking: 42, rebounding: 45, defense: 55, ovr: 60, floor: 0.68 },
    { name: "Cameron Johnson", pick: 11, pos: ["F"], scoring: 74, playmaking: 45, rebounding: 52, defense: 55, ovr: 72, floor: 0.78 },
    { name: "PJ Washington", pick: 12, pos: ["F"], scoring: 70, playmaking: 45, rebounding: 60, defense: 58, ovr: 70, floor: 0.75 },
    { name: "Tyler Herro", pick: 13, pos: ["G"], scoring: 82, playmaking: 55, rebounding: 42, defense: 45, ovr: 83, floor: 0.75 },
    { name: "Nickeil Alexander-Walker", pick: 17, pos: ["G"], scoring: 66, playmaking: 55, rebounding: 38, defense: 62, ovr: 72, floor: 0.7 },
    { name: "Matisse Thybulle", pick: 20, pos: ["G", "F"], scoring: 52, playmaking: 40, rebounding: 42, defense: 82, ovr: 62, floor: 0.72 },
    { name: "Brandon Clarke", pick: 21, pos: ["F","C"], scoring: 70, playmaking: 42, rebounding: 68, defense: 72, ovr: 72, floor: 0.75 },
    { name: "Keldon Johnson", pick: 29, pos: ["G", "F"], scoring: 72, playmaking: 48, rebounding: 55, defense: 55, ovr: 72, floor: 0.75 },
    { name: "Bol Bol", pick: 44, pos: ["C"], scoring: 58, playmaking: 30, rebounding: 55, defense: 50, ovr: 62, floor: 0.45 },
  ]},
  { year: 2020, players: [
    { name: "Anthony Edwards", pick: 1, pos: ["G","F"], scoring: 90, playmaking: 62, rebounding: 55, defense: 72, ovr: 93, floor: 0.75 },
    { name: "James Wiseman", pick: 2, pos: ["C"], scoring: 62, playmaking: 32, rebounding: 68, defense: 55, ovr: 62, floor: 0.5 },
    { name: "LaMelo Ball", pick: 3, pos: ["G"], scoring: 82, playmaking: 90, rebounding: 55, defense: 50, ovr: 85, floor: 0.65 },
    { name: "Patrick Williams", pick: 4, pos: ["F"], scoring: 62, playmaking: 40, rebounding: 55, defense: 68, ovr: 68, floor: 0.65 },
    { name: "Onyeka Okongwu", pick: 6, pos: ["C"], scoring: 68, playmaking: 42, rebounding: 78, defense: 82, ovr: 77, floor: 0.8 },
    { name: "Killian Hayes", pick: 7, pos: ["G"], scoring: 55, playmaking: 58, rebounding: 42, defense: 60, ovr: 56, floor: 0.6 },
    { name: "Obi Toppin", pick: 8, pos: ["F"], scoring: 70, playmaking: 42, rebounding: 55, defense: 50, ovr: 68, floor: 0.72 },
    { name: "Deni Avdija", pick: 9, pos: ["F"], scoring: 66, playmaking: 55, rebounding: 62, defense: 65, ovr: 76, floor: 0.75 },
    { name: "Devin Vassell", pick: 11, pos: ["G","F"], scoring: 74, playmaking: 48, rebounding: 45, defense: 72, ovr: 77, floor: 0.75 },
    { name: "Tyrese Haliburton", pick: 12, pos: ["G"], scoring: 76, playmaking: 90, rebounding: 42, defense: 55, ovr: 89, floor: 0.8 },
    { name: "Aaron Nesmith", pick: 14, pos: ["F"], scoring: 66, playmaking: 40, rebounding: 48, defense: 58, ovr: 64, floor: 0.7 },
    { name: "Cole Anthony", pick: 15, pos: ["G"], scoring: 70, playmaking: 60, rebounding: 48, defense: 50, ovr: 68, floor: 0.72 },
    { name: "Isaiah Stewart", pick: 16, pos: ["F","C"], scoring: 52, playmaking: 32, rebounding: 75, defense: 72, ovr: 70, floor: 0.75 },
    { name: "Saddiq Bey", pick: 19, pos: ["F"], scoring: 68, playmaking: 42, rebounding: 52, defense: 52, ovr: 66, floor: 0.72 },
    { name: "Precious Achiuwa", pick: 20, pos: ["F", "C"], scoring: 62, playmaking: 40, rebounding: 66, defense: 62, ovr: 64, floor: 0.7 },
    { name: "Tyrese Maxey", pick: 21, pos: ["G"], scoring: 82, playmaking: 68, rebounding: 35, defense: 58, ovr: 87, floor: 0.75 },
    { name: "Desmond Bane", pick: 30, pos: ["G"], scoring: 78, playmaking: 55, rebounding: 48, defense: 68, ovr: 81, floor: 0.75 },
  ]},
  { year: 2021, players: [
    { name: "Cade Cunningham", pick: 1, pos: ["G"], scoring: 84, playmaking: 82, rebounding: 50, defense: 58, ovr: 88, floor: 0.75 },
    { name: "Jalen Green", pick: 2, pos: ["G"], scoring: 84, playmaking: 50, rebounding: 40, defense: 55, ovr: 80, floor: 0.7 },
    { name: "Evan Mobley", pick: 3, pos: ["F","C"], scoring: 76, playmaking: 55, rebounding: 82, defense: 92, ovr: 88, floor: 0.8 },
    { name: "Scottie Barnes", pick: 4, pos: ["F","G"], scoring: 74, playmaking: 68, rebounding: 68, defense: 82, ovr: 84, floor: 0.8 },
    { name: "Jalen Suggs", pick: 5, pos: ["G"], scoring: 66, playmaking: 60, rebounding: 45, defense: 68, ovr: 66, floor: 0.72 },
    { name: "Josh Giddey", pick: 6, pos: ["G","F"], scoring: 66, playmaking: 78, rebounding: 62, defense: 55, ovr: 77, floor: 0.7 },
    { name: "Jonathan Kuminga", pick: 7, pos: ["F"], scoring: 74, playmaking: 42, rebounding: 55, defense: 62, ovr: 74, floor: 0.65 },
    { name: "Franz Wagner", pick: 8, pos: ["F"], scoring: 78, playmaking: 60, rebounding: 55, defense: 70, ovr: 85, floor: 0.8 },
    { name: "Davion Mitchell", pick: 9, pos: ["G"], scoring: 62, playmaking: 58, rebounding: 38, defense: 78, ovr: 70, floor: 0.7 },
    { name: "Ziaire Williams", pick: 10, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 45, defense: 50, ovr: 56, floor: 0.62 },
    { name: "Chris Duarte", pick: 13, pos: ["G"], scoring: 62, playmaking: 48, rebounding: 42, defense: 50, ovr: 60, floor: 0.65 },
    { name: "Corey Kispert", pick: 15, pos: ["F"], scoring: 68, playmaking: 42, rebounding: 45, defense: 50, ovr: 66, floor: 0.72 },
    { name: "Alperen Sengun", pick: 16, pos: ["C"], scoring: 78, playmaking: 68, rebounding: 82, defense: 62, ovr: 86, floor: 0.8 },
    { name: "Trey Murphy III", pick: 17, pos: ["F"], scoring: 72, playmaking: 45, rebounding: 50, defense: 58, ovr: 70, floor: 0.75 },
    { name: "Jalen Johnson", pick: 20, pos: ["F"], scoring: 66, playmaking: 52, rebounding: 62, defense: 58, ovr: 66, floor: 0.72 },
    { name: "Usman Garuba", pick: 23, pos: ["F","C"], scoring: 40, playmaking: 40, rebounding: 58, defense: 68, ovr: 58, floor: 0.6 },
    { name: "Herbert Jones", pick: 35, pos: ["F","G"], scoring: 58, playmaking: 42, rebounding: 55, defense: 88, ovr: 77, floor: 0.75 },
  ]},
  { year: 2022, players: [
    { name: "Paolo Banchero", pick: 1, pos: ["F"], scoring: 86, playmaking: 62, rebounding: 60, defense: 55, ovr: 86, floor: 0.83, grade: "A-" },
    { name: "Chet Holmgren", pick: 2, pos: ["F","C"], scoring: 76, playmaking: 55, rebounding: 68, defense: 90, ovr: 86, floor: 0.83, grade: "A-" },
    { name: "Jabari Smith Jr.", pick: 3, pos: ["F"], scoring: 70, playmaking: 40, rebounding: 62, defense: 68, ovr: 75, floor: 0.68, grade: "B-" },
    { name: "Keegan Murray", pick: 4, pos: ["F"], scoring: 74, playmaking: 38, rebounding: 55, defense: 58, ovr: 77, floor: 0.73, grade: "B" },
    { name: "Jaden Ivey", pick: 5, pos: ["G"], scoring: 74, playmaking: 55, rebounding: 35, defense: 55, ovr: 76, floor: 0.62, grade: "C+" },
    { name: "Bennedict Mathurin", pick: 6, pos: ["G","F"], scoring: 76, playmaking: 42, rebounding: 42, defense: 55, ovr: 77, floor: 0.68, grade: "B-" },
    { name: "Dyson Daniels", pick: 8, pos: ["G"], scoring: 62, playmaking: 55, rebounding: 55, defense: 78, ovr: 66, floor: 0.73, grade: "B" },
    { name: "Jeremy Sochan", pick: 9, pos: ["F"], scoring: 62, playmaking: 52, rebounding: 55, defense: 72, ovr: 73, floor: 0.62, grade: "C+" },
    { name: "Johnny Davis", pick: 10, pos: ["G"], scoring: 52, playmaking: 42, rebounding: 42, defense: 50, ovr: 52, floor: 0.55, grade: "C" },
    { name: "Jalen Williams", pick: 12, pos: ["G", "F"], scoring: 78, playmaking: 58, rebounding: 50, defense: 68, ovr: 78, floor: 0.83, grade: "A-" },
    { name: "Jalen Duren", pick: 13, pos: ["C"], scoring: 66, playmaking: 38, rebounding: 78, defense: 68, ovr: 68, floor: 0.73, grade: "B" },
    { name: "Ochai Agbaji", pick: 14, pos: ["G"], scoring: 62, playmaking: 42, rebounding: 45, defense: 55, ovr: 60, floor: 0.62, grade: "C+" },
    { name: "Mark Williams", pick: 15, pos: ["C"], scoring: 62, playmaking: 30, rebounding: 72, defense: 68, ovr: 75, floor: 0.68, grade: "B-" },
    { name: "Tari Eason", pick: 17, pos: ["F"], scoring: 62, playmaking: 40, rebounding: 62, defense: 78, ovr: 75, floor: 0.68, grade: "B-" },
    { name: "Malaki Branham", pick: 20, pos: ["G"], scoring: 62, playmaking: 45, rebounding: 38, defense: 48, ovr: 60, floor: 0.62, grade: "C+" },
    { name: "Christian Braun", pick: 21, pos: ["G","F"], scoring: 60, playmaking: 42, rebounding: 45, defense: 65, ovr: 75, floor: 0.68, grade: "B-" },
    { name: "Walker Kessler", pick: 22, pos: ["C"], scoring: 58, playmaking: 30, rebounding: 82, defense: 88, ovr: 79, floor: 0.73, grade: "B" },
  ]},
  { year: 2023, players: [
    { name: "Victor Wembanyama", pick: 1, pos: ["C","F"], scoring: 88, playmaking: 55, rebounding: 82, defense: 96, ovr: 95, floor: 0.92, grade: "A+" },
    { name: "Brandon Miller", pick: 2, pos: ["F"], scoring: 76, playmaking: 42, rebounding: 48, defense: 60, ovr: 79, floor: 0.78, grade: "B+" },
    { name: "Scoot Henderson", pick: 3, pos: ["G"], scoring: 74, playmaking: 72, rebounding: 35, defense: 55, ovr: 72, floor: 0.55, grade: "C" },
    { name: "Amen Thompson", pick: 4, pos: ["G","F"], scoring: 68, playmaking: 60, rebounding: 62, defense: 78, ovr: 84, floor: 0.83, grade: "A-" },
    { name: "Ausar Thompson", pick: 5, pos: ["F","G"], scoring: 66, playmaking: 55, rebounding: 66, defense: 82, ovr: 79, floor: 0.73, grade: "B" },
    { name: "Anthony Black", pick: 6, pos: ["G"], scoring: 56, playmaking: 55, rebounding: 42, defense: 68, ovr: 68, floor: 0.55, grade: "C" },
    { name: "Bilal Coulibaly", pick: 7, pos: ["F","G"], scoring: 58, playmaking: 45, rebounding: 48, defense: 74, ovr: 74, floor: 0.68, grade: "B-" },
    { name: "Jarace Walker", pick: 8, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 58, defense: 66, ovr: 58, floor: 0.62, grade: "C+" },
    { name: "Taylor Hendricks", pick: 9, pos: ["F","C"], scoring: 55, playmaking: 32, rebounding: 58, defense: 62, ovr: 66, floor: 0.48, grade: "C-" },
    { name: "Cason Wallace", pick: 10, pos: ["G"], scoring: 58, playmaking: 50, rebounding: 42, defense: 72, ovr: 60, floor: 0.68, grade: "B-" },
    { name: "Dereck Lively II", pick: 12, pos: ["C"], scoring: 48, playmaking: 35, rebounding: 65, defense: 78, ovr: 76, floor: 0.73, grade: "B" },
    { name: "Gradey Dick", pick: 13, pos: ["G","F"], scoring: 66, playmaking: 35, rebounding: 35, defense: 48, ovr: 68, floor: 0.62, grade: "C+" },
    { name: "Jordan Hawkins", pick: 14, pos: ["G"], scoring: 62, playmaking: 40, rebounding: 38, defense: 45, ovr: 58, floor: 0.62, grade: "C+" },
    { name: "Kobe Bufkin", pick: 15, pos: ["G"], scoring: 55, playmaking: 48, rebounding: 40, defense: 50, ovr: 54, floor: 0.55, grade: "C" },
    { name: "Cam Whitmore", pick: 20, pos: ["F"], scoring: 68, playmaking: 35, rebounding: 48, defense: 55, ovr: 70, floor: 0.62, grade: "C+" },
    { name: "Nick Smith Jr.", pick: 27, pos: ["G"], scoring: 56, playmaking: 45, rebounding: 36, defense: 45, ovr: 54, floor: 0.55, grade: "C" },
    { name: "GG Jackson", pick: 45, pos: ["F"], scoring: 66, playmaking: 40, rebounding: 48, defense: 45, ovr: 62, floor: 0.62, grade: "C+" },
  ]},
  { year: 2024, players: [
    { name: "Zaccharie Risacher", pick: 1, pos: ["F"], scoring: 66, playmaking: 38, rebounding: 45, defense: 62, ovr: 74, floor: 0.73, grade: "B" },
    { name: "Alex Sarr", pick: 2, pos: ["F","C"], scoring: 62, playmaking: 35, rebounding: 62, defense: 74, ovr: 76, floor: 0.73, grade: "B" },
    { name: "Reed Sheppard", pick: 3, pos: ["G"], scoring: 62, playmaking: 65, rebounding: 32, defense: 58, ovr: 73, floor: 0.68, grade: "B-" },
    { name: "Stephon Castle", pick: 4, pos: ["G","F"], scoring: 66, playmaking: 62, rebounding: 45, defense: 72, ovr: 80, floor: 0.78, grade: "B+" },
    { name: "Ron Holland", pick: 5, pos: ["F"], scoring: 56, playmaking: 40, rebounding: 55, defense: 66, ovr: 70, floor: 0.62, grade: "C+" },
    { name: "Tidjane Salaun", pick: 6, pos: ["F"], scoring: 52, playmaking: 38, rebounding: 52, defense: 55, ovr: 52, floor: 0.55, grade: "C" },
    { name: "Donovan Clingan", pick: 7, pos: ["C"], scoring: 58, playmaking: 32, rebounding: 78, defense: 84, ovr: 77, floor: 0.73, grade: "B" },
    { name: "Rob Dillingham", pick: 8, pos: ["G"], scoring: 62, playmaking: 58, rebounding: 36, defense: 48, ovr: 60, floor: 0.68, grade: "B-" },
    { name: "Zach Edey", pick: 9, pos: ["C"], scoring: 62, playmaking: 30, rebounding: 82, defense: 62, ovr: 75, floor: 0.68, grade: "B-" },
    { name: "Cody Williams", pick: 10, pos: ["F"], scoring: 52, playmaking: 40, rebounding: 45, defense: 55, ovr: 52, floor: 0.55, grade: "C" },
    { name: "Matas Buzelis", pick: 11, pos: ["F"], scoring: 60, playmaking: 40, rebounding: 45, defense: 60, ovr: 72, floor: 0.62, grade: "C+" },
    { name: "Devin Carter", pick: 13, pos: ["G"], scoring: 58, playmaking: 52, rebounding: 48, defense: 68, ovr: 58, floor: 0.62, grade: "C+" },
    { name: "Jared McCain", pick: 16, pos: ["G"], scoring: 62, playmaking: 42, rebounding: 32, defense: 48, ovr: 74, floor: 0.68, grade: "B-" },
    { name: "Dalton Knecht", pick: 17, pos: ["G","F"], scoring: 66, playmaking: 35, rebounding: 38, defense: 50, ovr: 72, floor: 0.62, grade: "C+" },
    { name: "Yves Missi", pick: 21, pos: ["C"], scoring: 55, playmaking: 35, rebounding: 68, defense: 66, ovr: 58, floor: 0.62, grade: "C+" },
  ]},
  { year: 2025, players: [
    { name: "Cooper Flagg", pick: 1, pos: ["F"], scoring: 78, playmaking: 60, rebounding: 62, defense: 72, ovr: 82, floor: 0.83, grade: "A-" },
    { name: "Dylan Harper", pick: 2, pos: ["G"], scoring: 74, playmaking: 68, rebounding: 42, defense: 58, ovr: 78, floor: 0.78, grade: "B+" },
    { name: "VJ Edgecombe", pick: 3, pos: ["G"], scoring: 68, playmaking: 50, rebounding: 42, defense: 70, ovr: 74, floor: 0.73, grade: "B" },
    { name: "Kon Knueppel", pick: 4, pos: ["G","F"], scoring: 66, playmaking: 48, rebounding: 38, defense: 52, ovr: 72, floor: 0.68, grade: "B-" },
    { name: "Ace Bailey", pick: 5, pos: ["F"], scoring: 70, playmaking: 38, rebounding: 45, defense: 55, ovr: 74, floor: 0.62, grade: "C+" },
    { name: "Tre Johnson", pick: 6, pos: ["G"], scoring: 68, playmaking: 40, rebounding: 32, defense: 50, ovr: 72, floor: 0.62, grade: "C+" },
    { name: "Jeremiah Fears", pick: 7, pos: ["G"], scoring: 62, playmaking: 55, rebounding: 32, defense: 52, ovr: 70, floor: 0.55, grade: "C" },
    { name: "Egor Demin", pick: 8, pos: ["G","F"], scoring: 56, playmaking: 58, rebounding: 40, defense: 48, ovr: 68, floor: 0.55, grade: "C" },
    { name: "Collin Murray-Boyles", pick: 9, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 62, defense: 68, ovr: 72, floor: 0.68, grade: "B-" },
    { name: "Khaman Maluach", pick: 10, pos: ["C"], scoring: 54, playmaking: 30, rebounding: 68, defense: 72, ovr: 72, floor: 0.62, grade: "C+" },
    { name: "Cedric Coward", pick: 11, pos: ["G", "F"], scoring: 60, playmaking: 45, rebounding: 45, defense: 55, ovr: 58, floor: 0.62, grade: "C+" },
    { name: "Noa Essengue", pick: 12, pos: ["F"], scoring: 58, playmaking: 42, rebounding: 55, defense: 55, ovr: 58, floor: 0.62, grade: "C+" },
    { name: "Derik Queen", pick: 13, pos: ["F","C"], scoring: 60, playmaking: 45, rebounding: 62, defense: 52, ovr: 72, floor: 0.62, grade: "C+" },
    { name: "Carter Bryant", pick: 14, pos: ["F"], scoring: 55, playmaking: 40, rebounding: 48, defense: 58, ovr: 54, floor: 0.55, grade: "C" },
    { name: "Thomas Sorber", pick: 15, pos: ["C"], scoring: 52, playmaking: 35, rebounding: 68, defense: 66, ovr: 70, floor: 0.55, grade: "C" },
    { name: "Nolan Traore", pick: 19, pos: ["G"], scoring: 56, playmaking: 55, rebounding: 38, defense: 48, ovr: 54, floor: 0.55, grade: "C" },
  ]},
  { year: 2026, players: [
    { name: "AJ Dybantsa", pick: 1, pos: ["F"], scoring: 76, playmaking: 55, rebounding: 52, defense: 62, ovr: 78, floor: 0.83, grade: "A-" },
    { name: "Darryn Peterson", pick: 2, pos: ["G"], scoring: 74, playmaking: 58, rebounding: 40, defense: 55, ovr: 76, floor: 0.78, grade: "B+" },
    { name: "Cameron Boozer", pick: 3, pos: ["F"], scoring: 68, playmaking: 45, rebounding: 68, defense: 58, ovr: 74, floor: 0.73, grade: "B" },
    { name: "Caleb Wilson", pick: 4, pos: ["F"], scoring: 62, playmaking: 42, rebounding: 60, defense: 62, ovr: 70, floor: 0.62, grade: "C+" },
    { name: "Keaton Wagler", pick: 5, pos: ["G"], scoring: 58, playmaking: 55, rebounding: 35, defense: 48, ovr: 66, floor: 0.55, grade: "C" },
    { name: "Mikel Brown Jr.", pick: 6, pos: ["G"], scoring: 60, playmaking: 58, rebounding: 32, defense: 52, ovr: 68, floor: 0.55, grade: "C" },
    { name: "Darius Acuff Jr.", pick: 7, pos: ["G"], scoring: 62, playmaking: 52, rebounding: 32, defense: 50, ovr: 66, floor: 0.48, grade: "C-" },
    { name: "Kingston Flemings", pick: 8, pos: ["G"], scoring: 56, playmaking: 55, rebounding: 34, defense: 55, ovr: 66, floor: 0.48, grade: "C-" },
    { name: "Morez Johnson Jr.", pick: 9, pos: ["F","C"], scoring: 52, playmaking: 35, rebounding: 68, defense: 62, ovr: 66, floor: 0.48, grade: "C-" },
    { name: "Nate Ament", pick: 10, pos: ["F"], scoring: 60, playmaking: 42, rebounding: 50, defense: 55, ovr: 58, floor: 0.62, grade: "C+" },
    { name: "Aday Mara", pick: 11, pos: ["C"], scoring: 48, playmaking: 32, rebounding: 62, defense: 60, ovr: 66, floor: 0.55, grade: "C" },
    { name: "Koa Peat", pick: 12, pos: ["F"], scoring: 58, playmaking: 45, rebounding: 58, defense: 55, ovr: 58, floor: 0.62, grade: "C+" },
    { name: "Darius Adams", pick: 13, pos: ["G"], scoring: 58, playmaking: 52, rebounding: 36, defense: 48, ovr: 56, floor: 0.55, grade: "C" },
    { name: "Brandon McCoy Jr.", pick: 14, pos: ["G"], scoring: 56, playmaking: 50, rebounding: 38, defense: 48, ovr: 54, floor: 0.55, grade: "C" },
    { name: "Zuby Ejiofor", pick: 21, pos: ["F","C"], scoring: 50, playmaking: 35, rebounding: 65, defense: 62, ovr: 64, floor: 0.42, grade: "D" },
  ]},
];

const SKILLS = ["scoring", "playmaking", "rebounding", "defense"];
const SKILL_LABEL = { scoring: "Scoring", playmaking: "Playmaking", rebounding: "Rebounding", defense: "Defense" };
const SKILL_COLOR = { scoring: "#D9A441", playmaking: "#7FA6A3", rebounding: "#C1443A", defense: "#6E8FC7" };

// 15 recognizable coaches, Phil Jackson era (1989) onward, each with a real system
// and two "favored" skill categories. Fit boosts your rating; mismatch drags it down —
// modestly, not decisively.
const COACHES = [
  { name: "Phil Jackson", system: "Triangle Offense", blurb: "Equal-touch ball movement out of the triangle.", favored: ["scoring", "playmaking"], rings: 11 },
  { name: "Gregg Popovich", system: "Motion & Ball Movement", blurb: "Read-and-react passing, defend everyone.", favored: ["playmaking", "defense"], rings: 5 },
  { name: "Pat Riley", system: "Showtime to Showforce", blurb: "Uptempo scoring backed by playoff toughness.", favored: ["scoring", "defense"], rings: 5 },
  { name: "Chuck Daly", system: "Bad Boys Physicality", blurb: "Grind on the glass, never let up on D.", favored: ["defense", "rebounding"], rings: 2 },
  { name: "Jerry Sloan", system: "Pick-and-Roll Flex", blurb: "Relentless two-man game and O-boards.", favored: ["playmaking", "rebounding"], rings: 0 },
  { name: "Larry Brown", system: "Play the Right Way", blurb: "Fundamentals, spacing, defense above all.", favored: ["defense", "rebounding"], rings: 1 },
  { name: "Doc Rivers", system: "Ubuntu Defense", blurb: "Culture-first, defense-and-togetherness.", favored: ["playmaking", "defense"], rings: 1 },
  { name: "Steve Kerr", system: "Positionless Motion", blurb: "Spacing, movement, 3-point volume.", favored: ["scoring", "playmaking"], rings: 4 },
  { name: "Rick Carlisle", system: "Inside-Out Attack", blurb: "Feed the post, kick out to shooters.", favored: ["scoring", "rebounding"], rings: 1 },
  { name: "Erik Spoelstra", system: "Positionless Culture", blurb: "Switch everything, score in transition.", favored: ["scoring", "defense"], rings: 2 },
  { name: "Mike D'Antoni", system: "Seven Seconds or Less", blurb: "Push pace, shoot early, outscore everyone.", favored: ["scoring", "playmaking"], rings: 0 },
  { name: "Tom Thibodeau", system: "Iron-Man Defense", blurb: "Heavy minutes for starters, D wins games.", favored: ["defense", "rebounding"], rings: 0 },
  { name: "Nick Nurse", system: "Junkyard Zone", blurb: "Shifting zone looks built to confuse.", favored: ["playmaking", "defense"], rings: 1 },
  { name: "Tyronn Lue", system: "Star-Driven Modern", blurb: "Build around shot creation, let stars cook.", favored: ["scoring", "playmaking"], rings: 1 },
  { name: "Frank Vogel", system: "Twin Towers Revival", blurb: "Feed size inside, dominate the glass.", favored: ["scoring", "rebounding"], rings: 1 },
];

// Pedigree bonus in flat rating points by real head-coaching championships (upside-only, hidden).
function pedigreePoints(rings) {
  if (rings >= 5) return 9;
  if (rings >= 3) return 6;
  if (rings >= 1) return 3;
  return 0;
}
function pedigreeLabel(rings) {
  if (rings >= 5) return "Legendary pedigree";
  if (rings >= 3) return "Champion pedigree";
  if (rings >= 1) return "Title-winning pedigree";
  return "No title pedigree";
}

const TOTAL_YEARS = 15;
const TOTAL_SPINS = 5;
const SLOT_NEED = { G: 2, F: 2, C: 1 };
const SLOT_INFO = [
  { key: "G", label: "GUARDS" },
  { key: "F", label: "FORWARDS" },
  { key: "C", label: "CENTER" },
];

const CURVE = [0.55, 0.72, 0.85, 0.97, 1.0, 1.0, 1.0, 1.0, 1.0, 0.93, 0.85, 0.75, 0.65, 0.55, 0.45];

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Peak OVR is stored per player (2K-style). This returns it directly.
function computeOVR(p) {
  return p.ovr;
}

// Potential-grade badge color (prospects only). A-tier gold, B neutral, C amber, D red.
function gradeColor(g) {
  if (!g) return "#8B96A5";
  const t = g[0];
  if (t === "A") return "#D9A441";
  if (t === "B") return "#7FA6A3";
  if (t === "C") return "#C98A3A";
  return "#C1443A";
}

function openSlots(roster) {
  const filled = { G: 0, F: 0, C: 0 };
  roster.forEach((p) => { filled[p.slot]++; });
  return { G: SLOT_NEED.G - filled.G, F: SLOT_NEED.F - filled.F, C: SLOT_NEED.C - filled.C };
}

// Display order: Guards, then Forwards, then Center (standard lineup reading order).
const SLOT_RANK = { G: 0, F: 1, C: 2 };
function byPosition(roster) {
  return [...roster].sort((a, b) => SLOT_RANK[a.slot] - SLOT_RANK[b.slot]);
}

// Coaching is a pure tailwind (upside-only), applied as flat rating points, hidden
// from the player. A great system fit adds up to +12 pts; a poor fit adds nothing
// (no penalty). Pedigree adds flat points on top, tiered by real championships.
function computeCoachBonus(roster, rolls, coach) {
  const totals = { scoring: 0, playmaking: 0, rebounding: 0, defense: 0 };
  roster.forEach((p, i) => { SKILLS.forEach((s) => { totals[s] += p[s] * rolls[i]; }); });
  const favoredAvg = (totals[coach.favored[0]] + totals[coach.favored[1]]) / 2;
  const others = SKILLS.filter((s) => !coach.favored.includes(s));
  const otherAvg = (totals[others[0]] + totals[others[1]]) / 2;
  const fitPts = clamp((favoredAvg - otherAvg) / 32, 0, 12);
  const pedPts = pedigreePoints(coach.rings);
  return { total: fitPts + pedPts, fitPts, pedPts };
}

const WIN_THRESHOLD = 444;
const WIN_SCALE = 29;
const REDUND_THRESHOLD = 310;
const REDUND_WEIGHT = 0.15;
function logistic(x) { return 1 / (1 + Math.exp(-x)); }

function runSimulation(roster, coach) {
  const rolls = roster.map((p) => (p.floor ? rand(p.floor, 1) : 1));
  const bonus = computeCoachBonus(roster, rolls, coach);
  const log = [];
  let rings = 0;
  const careerContribution = roster.map(() => 0);

  for (let year = 1; year <= TOTAL_YEARS; year++) {
    const curve = CURVE[year - 1];

    // OVR-driven team talent for this year (career arc + development roll applied).
    let talent = 0;
    const perPlayer = roster.map((p, i) => {
      const eff = p.ovr * rolls[i] * curve;
      talent += eff;
      careerContribution[i] += eff;
      return eff;
    });

    // Skill category balance still matters: a team missing a category is penalized.
    const catTotals = { scoring: 0, playmaking: 0, rebounding: 0, defense: 0 };
    roster.forEach((p, i) => { SKILLS.forEach((s) => { catTotals[s] += p[s] * rolls[i] * curve; }); });
    const shortfall = SKILLS.reduce((sum, s) => sum + Math.max(0, REDUND_THRESHOLD - catTotals[s]) * REDUND_WEIGHT, 0);

    const rating = talent - shortfall + bonus.total;
    const winProb = logistic((rating - WIN_THRESHOLD) / WIN_SCALE);
    const won = Math.random() < winProb;
    if (won) rings++;

    let leadIdx = 0;
    for (let i = 1; i < perPlayer.length; i++) if (perPlayer[i] > perPlayer[leadIdx]) leadIdx = i;

    log.push({ year, rating: Math.round(rating), won, leader: roster[leadIdx].name, catTotals: { ...catTotals } });
  }

  let bestIdx = 0;
  for (let i = 1; i < careerContribution.length; i++) if (careerContribution[i] > careerContribution[bestIdx]) bestIdx = i;

  const avgCats = { scoring: 0, playmaking: 0, rebounding: 0, defense: 0 };
  log.forEach((y) => SKILLS.forEach((s) => { avgCats[s] += y.catTotals[s] / TOTAL_YEARS; }));
  let weakest = SKILLS[0];
  SKILLS.forEach((s) => { if (avgCats[s] < avgCats[weakest]) weakest = s; });
  let strongest = SKILLS[0];
  SKILLS.forEach((s) => { if (avgCats[s] > avgCats[strongest]) strongest = s; });

  const totalContribution = careerContribution.reduce((a, b) => a + b, 0) || 1;
  const contributions = roster
    .map((p, i) => ({ name: p.name, slot: p.slot, ovr: p.ovr, share: careerContribution[i] / totalContribution, player: p }))
    .sort((a, b) => b.share - a.share);

  return { log, rings, bestPlayer: roster[bestIdx].name, weakestSkill: weakest, strongestSkill: strongest,
           fitPts: bonus.fitPts, pedPts: bonus.pedPts, avgCats, contributions };
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Describe a player's on-court role from their dominant skill.
function roleOf(p) {
  const top = SKILLS.reduce((a, s) => (p[s] > p[a] ? s : a), SKILLS[0]);
  return {
    scoring: pick(["a go-to scorer", "a bucket-getter", "the offensive engine"]),
    playmaking: pick(["the primary playmaker", "a floor general", "the table-setter"]),
    rebounding: pick(["a force on the glass", "a rebounding anchor", "a monster on the boards"]),
    defense: pick(["a defensive anchor", "a lockdown stopper", "the defensive backbone"]),
  }[top];
}

function ordinalYear(y) { return `year ${y}`; }

// Insulting recap for bad outcomes (0-1 rings). Mixes shots at specific players
// (by name and draft pick) with jabs at the GM. Zero rings is the harshest.
function buildRoast(result, roster, coach, rings) {
  const contrib = result.contributions;
  const byOvr = [...roster].sort((a, b) => a.ovr - b.ovr);
  const worst = byOvr[0];
  const secondWorst = byOvr[1];
  const star = contrib[0];
  const weak = SKILL_LABEL[result.weakestSkill].toLowerCase();
  const parts = [];

  // Opening gut-punch
  if (rings === 0) {
    parts.push(pick([
      `Fifteen seasons. Zero rings. Not one. Somewhere, Jordan is laughing at you with all six of his.`,
      `Zero titles in fifteen years. That's not a rebuild, that's a demolition — and you were the wrecking ball.`,
      `No banners. None. This front office should be under investigation.`,
    ]));
  } else {
    parts.push(pick([
      `One ring in fifteen years. Technically a champion, realistically a fluke.`,
      `A single title, then a decade of irrelevance. Jordan won six and you're bragging about one.`,
      `One banner. You'll tell that story forever because there's nothing else to tell.`,
    ]));
  }

  // Roast the worst pick by name + draft slot
  parts.push(pick([
    `${worst.name} at pick #${worst.pick}? A ${worst.ovr} overall was never carrying anyone, and he proved it.`,
    `Drafting ${worst.name} was the tell. A ${worst.ovr} overall doesn't move the needle — he barely moved the bench.`,
    `${worst.name} was supposed to be a piece. He was a hole. A ${worst.ovr}-overall crater right in the middle of your rotation.`,
  ]));

  // Second bad piece
  if (secondWorst && secondWorst.name !== worst.name) {
    parts.push(pick([
      `Pairing him with ${secondWorst.name} was doubling down on nothing.`,
      `And ${secondWorst.name} next to him? Two anchors, no boat.`,
      `${secondWorst.name} didn't help either — the two of them together couldn't hold a lead or a job.`,
    ]));
  }

  // GM-directed jab tied to the real weakness
  parts.push(pick([
    `You assembled five guys allergic to ${weak}. Opponents noticed by week two.`,
    `Your team treated ${weak} like it was optional. Fifteen years of film says it wasn't.`,
    `Whatever you thought you were building, it had no ${weak} and no plan.`,
  ]));

  // Even the best guy was wasted
  parts.push(pick([
    `Even ${star.name} couldn't drag this group to relevance, and that's genuinely impressive.`,
    `${star.name} deserved a real supporting cast. He got you instead.`,
    `You wasted the best years of ${star.name}. Send him an apology card.`,
  ]));

  // Coach kicker
  parts.push(pick([
    `${coach.name} coached his heart out and still couldn't fix this. That's on you, not him.`,
    `${coach.name} has ${coach.rings} ring${coach.rings === 1 ? "" : "s"} of his own and you still found a way to waste his time.`,
    `Somewhere ${coach.name} is quietly updating his résumé.`,
  ]));

  return parts.join(" ");
}

// Rich, data-driven season recap: picks a narrative angle from what actually happened,
// names specific players and their real contributions, weaves in the coach, ~5-7 sentences.
function buildRecap(result, roster, coach, rings) {
  const log = result.log;
  const titleYears = log.filter((y) => y.won).map((y) => y.year);
  const contrib = result.contributions;
  const star = contrib[0];
  const second = contrib[1];
  const parts = [];

  // --- Opening: narrative angle based on the shape of the run ---
  const early = titleYears.filter((y) => y <= 8).length;
  const late = titleYears.filter((y) => y >= 9).length;
  const starHeavy = star.share > 0.26;
  const bestYear = log.reduce((a, y) => (y.rating > a.rating ? y : a), log[0]);

  if (rings === 0) {
    parts.push(pick([
      `Fifteen seasons, no banners. ${star.name} did his part — ${bestYear.rating} was your peak team rating in ${ordinalYear(bestYear.year)} — but it never translated to a title.`,
      `This group never broke through. ${star.name} carried the load, and ${ordinalYear(bestYear.year)} was the closest you came, but the trophy case stayed empty.`,
    ]));
  } else if (starHeavy) {
    parts.push(pick([
      `This was ${star.name}'s team, top to bottom. As ${roleOf(star.player)}, he drove ${rings === 1 ? "the lone title" : `all ${rings} titles`}, with the rest of the five riding shotgun.`,
      `Make no mistake — ${star.name} was the whole show. ${rings === 1 ? "The one ring" : `All ${rings} rings`} ran through him as ${roleOf(star.player)}.`,
    ]));
  } else if (late > 0 && early === 0) {
    parts.push(pick([
      `A slow build that paid off late. The banners came in the back half — ${titleYears.join(", ").replace(/,([^,]*)$/, " and$1")} — once the young pieces grew into themselves.`,
      `Patience was the story. Nothing early, then a late surge: titles in ${titleYears.join(", ").replace(/,([^,]*)$/, " and$1")} as the roster finally matured.`,
    ]));
  } else if (early > 0 && late === 0) {
    parts.push(pick([
      `You peaked early and cashed in fast — ${rings === 1 ? "a title" : `${rings} titles`} inside the first eight years, then the window closed as the core aged out.`,
      `Strike while hot: ${rings === 1 ? "the ring" : `all ${rings} rings`} came early (${titleYears.join(", ").replace(/,([^,]*)$/, " and$1")}), and once the prime passed, so did the contention.`,
    ]));
  } else {
    parts.push(pick([
      `A steady, complete team that stayed in the hunt for years — ${rings} title${rings === 1 ? "" : "s"} across the run, spread out rather than bunched.`,
      `No single window; just sustained contention. ${rings} banner${rings === 1 ? "" : "s"} came at different stages, a sign of real staying power.`,
    ]));
  }

  // --- Supporting cast / second contributor ---
  if (rings > 0 && !starHeavy && second) {
    parts.push(pick([
      `${second.name} was the crucial second piece as ${roleOf(second.player)}, taking the pressure off ${star.name}.`,
      `${star.name} and ${second.name} formed the backbone — ${roleOf(second.player)} alongside the lead option.`,
    ]));
  } else if (rings > 0 && starHeavy && second) {
    parts.push(`${second.name} was the best of the supporting cast, but the gap to ${star.name} was wide.`);
  }

  // --- Team identity (strongest skill) ---
  parts.push(pick([
    `Identity-wise, this team won on ${SKILL_LABEL[result.strongestSkill].toLowerCase()}.`,
    `Your calling card was ${SKILL_LABEL[result.strongestSkill].toLowerCase()} — that's where the five was at its best.`,
  ]));

  // --- The flaw (weakest skill) ---
  parts.push(pick([
    `The soft spot was ${SKILL_LABEL[result.weakestSkill].toLowerCase()}; in the close years, that's what showed up.`,
    `Where it broke down was ${SKILL_LABEL[result.weakestSkill].toLowerCase()} — thin there, and good opponents found it.`,
  ]));

  // --- Coach ---
  if (result.fitPts > 6) {
    parts.push(pick([
      `${coach.name}'s ${coach.system} was a natural fit for this personnel, and it showed up as a real edge.`,
      `The roster was built for ${coach.name}'s ${coach.system} — that alignment paid off year after year.`,
    ]));
  } else if (result.fitPts > 1) {
    parts.push(`${coach.name}'s ${coach.system} was a loose fit — a slight lift, never a drag.`);
  } else {
    parts.push(pick([
      `${coach.name}'s ${coach.system} never quite matched the roster, so you won on raw talent rather than scheme.`,
      `The five didn't fit ${coach.name}'s ${coach.system}, but there was no penalty for it — you just leaned on ability.`,
    ]));
  }
  if (result.pedPts >= 6) {
    parts.push(`Having a proven winner like ${coach.name} on the bench nudged the tight games your way.`);
  }

  // --- Verdict ---
  if (rings >= 7) parts.push(pick(["Bottom line: you passed Jordan. This is a dynasty.", "The verdict: seven-plus rings. You cleared the six-ring bar."]));
  else if (rings === 6) parts.push("Bottom line: you tied the standard — six rings — but couldn't clear it.");
  else if (rings >= 4) parts.push("A genuine decade-long contender that fell just short of the ultimate goal.");
  else if (rings >= 1) parts.push("A real champion, though not enough to catch the GOAT.");
  else parts.push("Talented on paper, but the pieces never added up when it counted.");

  return parts.join(" ");
}

function verdict(rings) {
  if (rings >= 7) return { headline: "DYNASTY. YOU PASSED JORDAN.", tone: "gold" };
  if (rings === 6) return { headline: "TIED THE GOAT.", tone: "gold" };
  if (rings >= 4) return { headline: "HALL OF FAME RUN — BUT JORDAN WINS.", tone: "cream" };
  if (rings >= 1) return { headline: "A REAL CHAMPION. NOT ENOUGH TO CATCH JORDAN.", tone: "muted" };
  return { headline: "NO RINGS. THE FIT NEVER CAME TOGETHER.", tone: "red" };
}

function randomCoach() { return COACHES[Math.floor(Math.random() * COACHES.length)]; }

// Peak rating of a 5-man team (rolls=1, curve=1): OVR talent minus redundancy plus coach fit.
function evaluatePeakTeam(team, coach) {
  const rolls = team.map(() => 1);
  let talent = 0;
  const cat = { scoring: 0, playmaking: 0, rebounding: 0, defense: 0 };
  team.forEach((p) => { talent += p.ovr; SKILLS.forEach((s) => { cat[s] += p[s]; }); });
  const shortfall = SKILLS.reduce((sum, s) => sum + Math.max(0, REDUND_THRESHOLD - cat[s]) * REDUND_WEIGHT, 0);
  const bonus = computeCoachBonus(team, rolls, coach).total;
  return talent - shortfall + bonus;
}

// Best legal 2G/2F/1C team from the classes the player actually landed on, respecting
// the pick-number lock. Searches the top candidates per position (talent dominates).
function computeBestLineup(classYears, coach) {
  const players = [];
  DRAFT_CLASSES.forEach((c) => {
    if (classYears.includes(c.year)) c.players.forEach((p) => players.push({ ...p, classYear: c.year }));
  });
  const N = 14;
  const guards = players.filter((p) => p.pos.includes("G")).sort((a, b) => b.ovr - a.ovr).slice(0, N);
  const forwards = players.filter((p) => p.pos.includes("F")).sort((a, b) => b.ovr - a.ovr).slice(0, N);
  const centers = players.filter((p) => p.pos.includes("C")).sort((a, b) => b.ovr - a.ovr).slice(0, N);

  let best = null, bestVal = -Infinity;
  for (let a = 0; a < guards.length; a++) for (let b = a + 1; b < guards.length; b++) {
    const G1 = guards[a], G2 = guards[b];
    if (G1.pick === G2.pick || G1.name === G2.name) continue;
    for (let c = 0; c < forwards.length; c++) for (let d = c + 1; d < forwards.length; d++) {
      const F1 = forwards[c], F2 = forwards[d];
      const four = [G1, G2, F1, F2];
      if (new Set(four.map((p) => p.name)).size < 4) continue;
      if (new Set(four.map((p) => p.pick)).size < 4) continue;
      for (let e = 0; e < centers.length; e++) {
        const C = centers[e];
        if (four.some((p) => p.name === C.name || p.pick === C.pick)) continue;
        const val = evaluatePeakTeam([G1, G2, F1, F2, C], coach);
        if (val > bestVal) { bestVal = val; best = [G1, G2, F1, F2, C]; }
      }
    }
  }
  if (!best) return null;
  const slots = ["G", "G", "F", "F", "C"];
  return best.map((p, i) => ({ ...p, slot: slots[i] }));
}

// OVR number (prominent) plus small skill bars beneath it. In hard mode (hidden),
// ratings are masked with a "?" until the team is locked.
function StatBlock({ player, compact, hidden }) {
  const h = compact ? 16 : 20;
  if (hidden) {
    return (
      <div style={{
        fontFamily: "'Anton', sans-serif",
        fontSize: compact ? 20 : 24,
        lineHeight: 1,
        color: "#4A5568",
        minWidth: compact ? 26 : 34,
        textAlign: "center",
        letterSpacing: 1,
      }}>?</div>
    );
  }
  const ovr = computeOVR(player);
  const ovrColor = ovr >= 90 ? "#D9A441" : ovr >= 80 ? "#E8BE5E" : ovr >= 70 ? "#C9D0DA" : "#8B96A5";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        fontFamily: "'Anton', sans-serif",
        fontSize: compact ? 20 : 26,
        lineHeight: 1,
        color: ovrColor,
        minWidth: compact ? 26 : 34,
        textAlign: "right",
      }}>{ovr}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: h }}>
        {SKILLS.map((s) => {
          const val = player[s];
          const barH = Math.max(3, (val / 99) * h);
          return (
            <div key={s} title={`${SKILL_LABEL[s]}: ${val}`} style={{
              width: compact ? 5 : 6,
              height: barH,
              borderRadius: 2,
              background: SKILL_COLOR[s],
              opacity: 0.9,
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ============ COMPONENT ============
export default function SixRings() {
  const [phase, setPhase] = useState("modeSelect"); // modeSelect | coachSelect | draft | ready | simming | results
  const [mode, setMode] = useState(null); // 'easy' | 'hard'
  const [pool, setPool] = useState(DRAFT_CLASSES);
  const [roster, setRoster] = useState([]);
  const [coach, setCoach] = useState(null);
  const [coachSpinning, setCoachSpinning] = useState(false);
  const [coachLabel, setCoachLabel] = useState("???");
  const [spinning, setSpinning] = useState(false);
  const [revealedClass, setRevealedClass] = useState(null);
  const [spinLabel, setSpinLabel] = useState("SPIN");
  const [pendingChoice, setPendingChoice] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [visibleYears, setVisibleYears] = useState(0);
  const coachTimer = useRef(null);
  const spinTimer = useRef(null);
  const simTimer = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(coachTimer.current);
      clearInterval(spinTimer.current);
      clearInterval(simTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function spinCoach() {
    setCoachSpinning(true);
    setCoach(null);
    let ticks = 0;
    coachTimer.current = setInterval(() => {
      const c = COACHES[Math.floor(Math.random() * COACHES.length)];
      setCoachLabel(c.name);
      ticks++;
      if (ticks > 16) {
        clearInterval(coachTimer.current);
        const chosen = randomCoach();
        setCoachLabel(chosen.name);
        setCoach(chosen);
        setCoachSpinning(false);
      }
    }, 70);
  }

  function lockInCoach() {
    if (!coach || coachSpinning) return;
    setPhase("draft");
  }

  const opens = openSlots(roster);
  const usedPicks = roster.map((p) => p.pick);

  function isEligible(player) {
    const posOK = player.pos.some((p) => opens[p] > 0);
    const pickOK = !usedPicks.includes(player.pick);
    return { posOK, pickOK, ok: posOK && pickOK };
  }

  function spin() {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    setRevealedClass(null);
    setPendingChoice(null);
    let ticks = 0;
    spinTimer.current = setInterval(() => {
      const r = pool[Math.floor(Math.random() * pool.length)];
      setSpinLabel(String(r.year));
      ticks++;
      if (ticks > 14) {
        clearInterval(spinTimer.current);
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setSpinLabel(String(chosen.year));
        setRevealedClass(chosen);
        setPool((p) => p.filter((c) => c.year !== chosen.year));
        setSpinning(false);
      }
    }, 80);
  }

  function attemptDraft(player) {
    const { ok } = isEligible(player);
    if (!ok) return;
    const valid = player.pos.filter((p) => opens[p] > 0);
    if (valid.length === 1) finalizeDraft(player, valid[0]);
    else setPendingChoice({ player, options: valid });
  }

  function finalizeDraft(player, slot) {
    const newRoster = [...roster, { ...player, classYear: revealedClass.year, slot }];
    setRoster(newRoster);
    setRevealedClass(null);
    setPendingChoice(null);
    setSpinLabel("SPIN");
    if (newRoster.length >= TOTAL_SPINS) setPhase("ready");
  }

  function skipClass() {
    setRevealedClass(null);
    setPendingChoice(null);
    setSpinLabel("SPIN");
  }

  function startSim() {
    setPhase("simming");
    const result = runSimulation(roster, coach);
    setSimResult(result);
    setVisibleYears(0);
    simTimer.current = setInterval(() => {
      setVisibleYears((v) => {
        if (v >= TOTAL_YEARS) {
          clearInterval(simTimer.current);
          setTimeout(() => setPhase("results"), 400);
          return v;
        }
        return v + 1;
      });
    }, 160);
  }

  function reset() {
    setPhase("modeSelect");
    setMode(null);
    setPool(DRAFT_CLASSES);
    setRoster([]);
    setSimResult(null);
    setVisibleYears(0);
    setRevealedClass(null);
    setPendingChoice(null);
    setSpinLabel("SPIN");
    setCoach(null);
    setCoachLabel("???");
  }

  const ringsSoFar = simResult ? simResult.log.slice(0, visibleYears).filter((y) => y.won).length : 0;
  const v = simResult && phase === "results" ? verdict(simResult.rings) : null;
  const recap = simResult && phase === "results"
    ? (simResult.rings <= 1 ? buildRoast(simResult, roster, coach, simResult.rings) : buildRecap(simResult, roster, coach, simResult.rings))
    : "";
  const bestLineup = simResult && phase === "results" && coach ? computeBestLineup(roster.map((p) => p.classYear), coach) : null;
  const nailedIt = bestLineup && new Set(bestLineup.map((p) => p.name)).size === 5 &&
    roster.every((p) => bestLineup.some((b) => b.name === p.name));

  function copyShare() {
    const names = roster.map((p) => p.name.split(" ").pop()).join(", ");
    const text = `I drafted ${names} under ${coach.name}'s ${coach.system} and won ${simResult.rings} ring${simResult.rings === 1 ? "" : "s"} in 15 seasons. Jordan has 6. Beat me at SIX RINGS.`;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  }

  const eligiblePlayers = revealedClass ? revealedClass.players.filter((p) => isEligible(p).ok) : [];

  return (
    <div className="wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .wrap { min-height: 100vh; background: radial-gradient(ellipse at top, #151b24 0%, #0D1117 60%); color: #EDE6D6; font-family: 'Inter', sans-serif; display: flex; justify-content: center; padding: 28px 16px 60px; }
        .stage { width: 100%; max-width: 640px; }
        .title { font-family: 'Anton', sans-serif; font-size: 42px; letter-spacing: 1px; text-align: center; color: #EDE6D6; line-height: 1; margin-bottom: 4px; }
        .title span { color: #D9A441; }
        .subtitle { text-align: center; color: #8B96A5; font-size: 14px; margin-bottom: 18px; }

        .coachCard { background: #161B22; border: 1px solid #2A3340; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; text-align: center; }
        .coachLabel { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #8B96A5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .coachName { font-family: 'Anton', sans-serif; font-size: 22px; color: #D9A441; letter-spacing: 0.5px; min-height: 26px; }
        .coachSystem { font-size: 13px; color: #EDE6D6; margin: 2px 0 4px; }
        .coachBlurb { font-size: 12px; color: #8B96A5; }
        .coachFav { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #7FA6A3; margin-top: 6px; }
        .coachPed { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #D9A441; margin-top: 3px; }

        .modeHeader { font-family: 'Anton', sans-serif; font-size: 22px; color: #EDE6D6; text-align: center; letter-spacing: 1px; margin-bottom: 16px; }
        .rulesList { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
        .ruleItem { display: flex; gap: 10px; align-items: flex-start; }
        .ruleText { font-size: 13px; line-height: 1.5; color: #C9D0DA; }
        .ruleText b { color: #EDE6D6; }
        .ruleNum { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: #D9A441; color: #1a1204; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
        .modeRow { display: flex; gap: 12px; flex-wrap: wrap; }
        .modeBtn { flex: 1; min-width: 200px; background: #1C2530; border: 1.5px solid #2A3340; border-radius: 10px; padding: 20px 18px; cursor: pointer; text-align: left; transition: border-color 0.15s ease, background 0.15s ease; }
        .modeBtn:hover { border-color: #D9A441; background: #232D3A; }
        .modeBtn.hard:hover { border-color: #C1443A; }
        .modeName { font-family: 'Anton', sans-serif; font-size: 26px; letter-spacing: 1px; color: #D9A441; margin-bottom: 8px; }
        .modeBtn.hard .modeName { color: #C1443A; }
        .modeDesc { font-size: 13px; line-height: 1.5; color: #8B96A5; }
        .hardBanner { background: rgba(193,68,58,0.12); border: 1px solid rgba(193,68,58,0.4); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12.5px; color: #E0958E; text-align: center; }
        .coachActions { display: flex; justify-content: center; gap: 10px; margin-top: 14px; }
        .coachBtnGold { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 14px; background: #D9A441; color: #1a1204; border: none; border-radius: 8px; padding: 11px 22px; cursor: pointer; }
        .coachBtnGold:hover:not(:disabled) { background: #E8BE5E; }
        .coachBtnGold:disabled { opacity: 0.4; cursor: default; }
        .coachBtnGhost { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; background: transparent; color: #8B96A5; border: 1.5px solid #3A4250; border-radius: 8px; padding: 10px 18px; cursor: pointer; }
        .coachBtnGhost:hover:not(:disabled) { border-color: #8B96A5; color: #EDE6D6; }
        .coachBtnGhost:disabled { opacity: 0.35; cursor: default; }

        .rafters { display: flex; justify-content: center; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
        .banner { width: 34px; height: 44px; border-radius: 2px 2px 6px 6px; border: 1.5px solid #3A4250; background: #161B22; display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #4A5568; transition: all 0.35s ease; }
        .banner.won { background: linear-gradient(180deg, #E8BE5E, #C1892E); border-color: #E8BE5E; color: #1a1204; font-weight: 700; transform: translateY(2px); box-shadow: 0 3px 10px rgba(217,164,65,0.35); }

        .card { background: #161B22; border: 1px solid #232B36; border-radius: 10px; padding: 24px; }

        .slotRow { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .slotPill { display: flex; align-items: center; gap: 7px; border: 1.5px solid #3A4250; border-radius: 20px; padding: 6px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #8B96A5; }
        .slotPill.done { border-color: #D9A441; color: #D9A441; }

        .legendRow { display: flex; justify-content: center; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
        .legendItem { display: flex; align-items: center; gap: 5px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #8B96A5; }
        .legendDot { width: 8px; height: 8px; border-radius: 2px; }

        .rosterList { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
        .rosterItem { display: flex; align-items: center; gap: 10px; background: #1C2530; border-radius: 6px; padding: 10px 14px; font-size: 14px; flex-wrap: wrap; }
        .rosterItem .name { flex: 1; min-width: 100px; }
        .rosterItem .yr, .rosterItem .pk { font-family: 'IBM Plex Mono', monospace; color: #8B96A5; font-size: 11px; }
        .gradeBadge { display: inline-flex; align-items: center; gap: 3px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700; border: 1.5px solid; border-radius: 5px; padding: 1px 5px; line-height: 1.3; }
        .gradeBadge .potTag { font-size: 8px; font-weight: 600; opacity: 0.7; letter-spacing: 0.5px; }
        .slotTag { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; width: 22px; height: 22px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .slotTag.G { background: rgba(127,166,163,0.18); color: #7FA6A3; }
        .slotTag.F { background: rgba(217,164,65,0.18); color: #D9A441; }
        .slotTag.C { background: rgba(193,68,58,0.18); color: #C1443A; }

        .spinZone { text-align: center; padding: 10px 0 6px; }
        .wheel { font-family: 'Anton', sans-serif; font-size: 54px; color: #D9A441; letter-spacing: 2px; margin-bottom: 14px; min-height: 64px; }
        .spinBtn { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; background: #C1443A; color: #EDE6D6; border: none; border-radius: 8px; padding: 14px 34px; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; }
        .spinBtn:hover:not(:disabled) { background: #D4544A; transform: translateY(-1px); }
        .spinBtn:disabled { opacity: 0.5; cursor: default; }

        .classHeader { text-align: center; font-family: 'IBM Plex Mono', monospace; color: #8B96A5; font-size: 13px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .classHeader b { color: #D9A441; font-size: 15px; }

        .playerGrid { display: flex; flex-direction: column; gap: 8px; max-height: 440px; overflow-y: auto; }
        .playerBtn { display: flex; justify-content: space-between; align-items: center; gap: 10px; background: #1C2530; border: 1px solid #2A3340; border-radius: 8px; padding: 12px 15px; cursor: pointer; font-size: 14px; color: #EDE6D6; transition: border-color 0.15s ease, background 0.15s ease; text-align: left; }
        .playerBtn:hover:not(:disabled) { border-color: #D9A441; background: #232D3A; }
        .playerBtn:disabled { opacity: 0.35; cursor: default; }
        .playerBtn .left { display: flex; flex-direction: column; gap: 4px; }
        .playerBtn .nameRow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .playerBtn .posTag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #8B96A5; border: 1px solid #3A4250; border-radius: 4px; padding: 2px 5px; }
        .playerBtn .pickTag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #7FA6A3; }

        .deadClass { text-align: center; padding: 6px 0; }
        .deadClass p { color: #8B96A5; font-size: 14px; margin-bottom: 16px; }

        .chooseSlot { text-align: center; background: #1C2530; border-radius: 8px; padding: 16px; margin-top: 4px; }
        .chooseSlot p { font-size: 14px; margin-bottom: 10px; color: #EDE6D6; }
        .chooseRow { display: flex; justify-content: center; gap: 10px; }
        .chooseBtn { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px; background: #2A3340; color: #EDE6D6; border: 1px solid #3A4250; border-radius: 6px; padding: 9px 16px; cursor: pointer; }
        .chooseBtn:hover { border-color: #D9A441; color: #D9A441; }

        .readyBtn, .again { display: block; margin: 18px auto 0; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 15px; background: #D9A441; color: #1a1204; border: none; border-radius: 8px; padding: 14px 30px; cursor: pointer; }
        .readyBtn:hover, .again:hover { background: #E8BE5E; }

        .simLog { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #8B96A5; text-align: center; min-height: 20px; }
        .simLeader { font-size: 12px; color: #7FA6A3; text-align: center; margin-top: 2px; }

        .resultHeadline { font-family: 'Anton', sans-serif; font-size: 26px; text-align: center; margin-bottom: 6px; letter-spacing: 0.5px; }
        .tone-gold { color: #D9A441; }
        .tone-cream { color: #EDE6D6; }
        .tone-muted { color: #8B96A5; }
        .tone-red { color: #C1443A; }

        .ringTally { text-align: center; font-family: 'IBM Plex Mono', monospace; color: #8B96A5; font-size: 14px; margin-bottom: 16px; }
        .ringTally b { color: #EDE6D6; font-size: 20px; }

        .recapBox { background: #1C2530; border-radius: 8px; padding: 16px; font-size: 13.5px; line-height: 1.6; color: #C9D0DA; margin-bottom: 18px; }
        .bestLineup { border: 1px solid #2A3340; border-radius: 8px; padding: 16px; margin-bottom: 18px; }
        .bestLineupHeader { font-family: 'Anton', sans-serif; font-size: 17px; letter-spacing: 0.5px; color: #D9A441; text-align: center; margin-bottom: 4px; }
        .bestLineupSub { font-size: 12px; color: #8B96A5; text-align: center; margin-bottom: 14px; line-height: 1.5; }

        .shareBtn { display: block; margin: 0 auto 10px; background: transparent; border: 1.5px solid #3A4250; color: #EDE6D6; border-radius: 8px; padding: 11px 22px; font-family: 'Inter', sans-serif; font-weight: 600; cursor: pointer; }
        .shareBtn:hover { border-color: #D9A441; color: #D9A441; }

        .footer { text-align: center; color: #4A5568; font-size: 12px; margin-top: 22px; line-height: 1.6; }
      `}</style>

      <div className="stage">
        <div className="title">SIX <span>RINGS</span></div>
        <div className="subtitle">Draft five rookies. Live fifteen seasons. Try to beat Jordan.</div>

        {phase === "modeSelect" && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="modeHeader">HOW TO PLAY</div>
            <div className="rulesList">
              <div className="ruleItem"><span className="ruleNum">1</span><div className="ruleText">You get <b>5 spins</b>. Each lands on a random draft class (no repeats). Sign <b>one player</b> per spin.</div></div>
              <div className="ruleItem"><span className="ruleNum">2</span><div className="ruleText">Your five must be <b>2 guards, 2 forwards, 1 center</b>.</div></div>
              <div className="ruleItem"><span className="ruleNum">3</span><div className="ruleText"><b>No two players can share a draft-pick number</b> — even across different years. Draft a #1 overall and every other #1 (in any class) is off the board for the rest of your draft.</div></div>
              <div className="ruleItem"><span className="ruleNum">4</span><div className="ruleText">A random <b>coach</b> is assigned. If your skills fit his system, you get a bonus — it never hurts you.</div></div>
              <div className="ruleItem"><span className="ruleNum">5</span><div className="ruleText">Your five plays <b>15 seasons</b>. Goal: win more than <b>Jordan's 6 rings</b>.</div></div>
            </div>
            <div className="modeHeader" style={{ marginTop: 18 }}>CHOOSE YOUR DIFFICULTY</div>
            <div className="modeRow">
              <button className="modeBtn" onClick={() => { setMode("easy"); setPhase("coachSelect"); spinCoach(); }}>
                <div className="modeName">EASY</div>
                <div className="modeDesc">Every player's overall, skill bars, and potential grade are visible as you draft. Build with full information.</div>
              </button>
              <button className="modeBtn hard" onClick={() => { setMode("hard"); setPhase("coachSelect"); spinCoach(); }}>
                <div className="modeName">HARD</div>
                <div className="modeDesc">Draft blind — no ratings, bars, or grades. You pick on names and reputation alone. Everything is revealed once your five is locked.</div>
              </button>
            </div>
          </div>
        )}

        {phase === "coachSelect" ? (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="coachLabel" style={{ textAlign: "center" }}>Spinning for your coach</div>
            <div className="coachName" style={{ textAlign: "center", fontSize: 30, margin: "10px 0" }}>{coachLabel}</div>
            {!coachSpinning && coach && (
              <>
                <div className="coachSystem" style={{ textAlign: "center" }}>{coach.system}</div>
                <div className="coachBlurb" style={{ textAlign: "center" }}>{coach.blurb}</div>
                <div className="coachFav" style={{ textAlign: "center" }}>
                  Rewards: {SKILL_LABEL[coach.favored[0]]} + {SKILL_LABEL[coach.favored[1]]}
                </div>
                <div className="coachPed" style={{ textAlign: "center" }}>
                  {coach.rings} {coach.rings === 1 ? "ring" : "rings"} &mdash; {pedigreeLabel(coach.rings)}
                </div>
                <div className="coachActions">
                  <button className="coachBtnGold" onClick={lockInCoach}>LOCK IN & DRAFT</button>
                </div>
              </>
            )}
          </div>
        ) : phase === "modeSelect" ? null : (
          <div className="coachCard">
            <div className="coachLabel">Your Coach</div>
            <div className="coachName">{coach.name}</div>
            <div className="coachSystem">{coach.system}</div>
            <div className="coachBlurb">{coach.blurb}</div>
            <div className="coachFav">Rewards: {SKILL_LABEL[coach.favored[0]]} + {SKILL_LABEL[coach.favored[1]]}</div>
            <div className="coachPed">
              {coach.rings} {coach.rings === 1 ? "ring" : "rings"} &mdash; {pedigreeLabel(coach.rings)}
            </div>
          </div>
        )}

        {phase !== "coachSelect" && phase !== "modeSelect" && (
          <div className="rafters">
            {Array.from({ length: TOTAL_YEARS }).map((_, i) => {
              const won = simResult && i < visibleYears && simResult.log[i].won;
              return <div key={i} className={"banner" + (won ? " won" : "")}>{won ? "\u2605" : i + 1}</div>;
            })}
          </div>
        )}

        {phase !== "coachSelect" && phase !== "modeSelect" && (
        <div className="card">
          {phase === "draft" && (
            <>
              <div className="slotRow">
                {SLOT_INFO.map((s) => {
                  const filled = SLOT_NEED[s.key] - opens[s.key];
                  return (
                    <div key={s.key} className={"slotPill" + (filled >= SLOT_NEED[s.key] ? " done" : "")}>
                      <b>{s.label}</b> {filled}/{SLOT_NEED[s.key]}
                    </div>
                  );
                })}
              </div>

              {mode === "hard" && (
                <div className="hardBanner">HARD MODE &mdash; ratings hidden. Draft on names alone; all stats reveal once your five is locked.</div>
              )}

              {mode !== "hard" && (
              <div className="legendRow">
                <div className="legendItem" style={{ color: "#D9A441" }}>
                  <b style={{ fontFamily: "'Anton', sans-serif", fontSize: 13 }}>##</b> OVR
                </div>
                {SKILLS.map((s) => (
                  <div className="legendItem" key={s}>
                    <span className="legendDot" style={{ background: SKILL_COLOR[s] }} />
                    {SKILL_LABEL[s]}
                  </div>
                ))}
                <div className="legendItem">
                  <span className="gradeBadge" style={{ color: "#7FA6A3", borderColor: "#7FA6A3", fontSize: 10 }}><span className="potTag">POT</span>A</span> = Potential (prospects)
                </div>
              </div>
              )}

              {roster.length > 0 && (
                <div className="rosterList">
                  {byPosition(roster).map((p, i) => (
                    <div className="rosterItem" key={p.name}>
                      <span className={"slotTag " + p.slot}>{p.slot}</span>
                      <span className="name">{p.name}</span>
                      {p.grade && mode !== "hard" && <span className="gradeBadge" style={{ color: gradeColor(p.grade), borderColor: gradeColor(p.grade) }}><span className="potTag">POT</span>{p.grade}</span>}
                      <StatBlock player={p} compact hidden={mode === "hard"} />
                      <span className="pk">#{p.pick}</span>
                      <span className="yr">{p.classYear}</span>
                    </div>
                  ))}
                </div>
              )}

              {!revealedClass && (
                <div className="spinZone">
                  <div className="wheel">{spinLabel}</div>
                  <button className="spinBtn" onClick={spin} disabled={spinning}>
                    {spinning ? "SPINNING..." : `SPIN FOR PICK ${roster.length + 1}`}
                  </button>
                </div>
              )}

              {revealedClass && !pendingChoice && (
                <div>
                  <div className="classHeader">Draft class landed on <b>{revealedClass.year}</b> — sign one</div>
                  {eligiblePlayers.length === 0 ? (
                    <div className="deadClass">
                      <p>No one in this class fits an open slot or an unused pick number.</p>
                      <button className="spinBtn" onClick={skipClass}>SPIN AGAIN</button>
                    </div>
                  ) : (
                    <div className="playerGrid">
                      {(mode === "hard" ? [...revealedClass.players].sort((a, b) => a.pick - b.pick) : revealedClass.players).map((p) => {
                        const { ok, posOK, pickOK } = isEligible(p);
                        const reason = !pickOK ? `PICK #${p.pick} TAKEN` : !posOK ? "SLOT FULL" : null;
                        return (
                          <button key={p.name} className="playerBtn" disabled={!ok} onClick={() => attemptDraft(p)}>
                            <span className="left">
                              <span className="nameRow">
                                <span>{p.name}</span>
                                <span className="posTag">{p.pos.join("/")}</span>
                                <span className="pickTag">#{p.pick}</span>
                                {p.grade && mode !== "hard" && <span className="gradeBadge" style={{ color: gradeColor(p.grade), borderColor: gradeColor(p.grade) }}><span className="potTag">POT</span>{p.grade}</span>}
                                {reason && <span className="posTag">{reason}</span>}
                              </span>
                              <StatBlock player={p} hidden={mode === "hard"} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {pendingChoice && (
                <div className="chooseSlot">
                  <p>{pendingChoice.player.name} can play either position — sign him as:</p>
                  <div className="chooseRow">
                    {pendingChoice.options.map((slot) => (
                      <button key={slot} className="chooseBtn" onClick={() => finalizeDraft(pendingChoice.player, slot)}>
                        {slot === "G" ? "GUARD" : slot === "F" ? "FORWARD" : "CENTER"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {phase === "ready" && (
            <>
              <div className="classHeader"><b>Your five</b></div>
              <div className="legendRow">
                <div className="legendItem" style={{ color: "#D9A441" }}>
                  <b style={{ fontFamily: "'Anton', sans-serif", fontSize: 13 }}>##</b> OVR
                </div>
                {SKILLS.map((s) => (
                  <div className="legendItem" key={s}>
                    <span className="legendDot" style={{ background: SKILL_COLOR[s] }} />
                    {SKILL_LABEL[s]}
                  </div>
                ))}
                <div className="legendItem">
                  <span className="gradeBadge" style={{ color: "#7FA6A3", borderColor: "#7FA6A3", fontSize: 10 }}><span className="potTag">POT</span>A</span> = Potential (prospects)
                </div>
              </div>
              <div className="rosterList">
                {byPosition(roster).map((p, i) => (
                  <div className="rosterItem" key={p.name}>
                    <span className={"slotTag " + p.slot}>{p.slot}</span>
                    <span className="name">{p.name}</span>
                    {p.grade && <span className="gradeBadge" style={{ color: gradeColor(p.grade), borderColor: gradeColor(p.grade) }}><span className="potTag">POT</span>{p.grade}</span>}
                    <StatBlock player={p} compact />
                    <span className="pk">#{p.pick}</span>
                    <span className="yr">{p.classYear}</span>
                  </div>
                ))}
              </div>
              <button className="readyBtn" onClick={startSim}>SIMULATE 15 SEASONS</button>
            </>
          )}

          {phase === "simming" && (
            <div className="spinZone">
              <div className="wheel">{visibleYears < TOTAL_YEARS ? `YEAR ${visibleYears + 1}` : "FINAL"}</div>
              <div className="simLog">
                {visibleYears > 0 ? (simResult.log[visibleYears - 1].won ? "CHAMPIONS." : "season complete.") : ""}
              </div>
              {visibleYears > 0 && (
                <div className="simLeader">Leading player: {simResult.log[visibleYears - 1].leader}</div>
              )}
              <div className="ringTally">Rings so far: <b>{ringsSoFar}</b></div>
            </div>
          )}

          {phase === "results" && v && (
            <>
              <div className={"resultHeadline tone-" + v.tone}>{v.headline}</div>
              <div className="ringTally">
                Your five won <b>{simResult.rings}</b> ring{simResult.rings === 1 ? "" : "s"} in 15 seasons &mdash; Jordan has <b>6</b>.
              </div>
              <div className="recapBox">{recap}</div>

              {bestLineup && (
                <div className="bestLineup">
                  <div className="bestLineupHeader">
                    {nailedIt ? "YOU DRAFTED THE OPTIMAL FIVE" : "THE BEST FIVE YOU COULD'VE BUILT"}
                  </div>
                  <div className="bestLineupSub">
                    {nailedIt
                      ? "From the classes you landed on, no legal lineup beats what you drafted. Respect."
                      : (simResult.rings <= 1
                        ? "This was sitting right there in the same classes you drafted from."
                        : "The optimal legal five from the exact classes you landed on.")}
                  </div>
                  <div className="rosterList">
                    {byPosition(bestLineup).map((p) => (
                      <div className="rosterItem" key={p.name}>
                        <span className={"slotTag " + p.slot}>{p.slot}</span>
                        <span className="name">{p.name}</span>
                        <StatBlock player={p} compact />
                        <span className="pk">#{p.pick}</span>
                        <span className="yr">{p.classYear}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="shareBtn" onClick={copyShare}>COPY RESULT TO SHARE</button>
              <button className="again" onClick={reset}>DRAFT A NEW FIVE</button>
            </>
          )}
        </div>
        )}

        <div className="footer">
          2 guards, 2 forwards, 1 center. No two players can share a draft-pick number,<br />
          even across different years. A letter grade marks a prospect's potential &mdash; higher grades<br />
          reach their ceiling more reliably. Your coach's system is an upside-only bonus.
        </div>
      </div>
    </div>
  );
}
