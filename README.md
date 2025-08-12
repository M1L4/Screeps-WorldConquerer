# Screeps-WorldConquerer

*Even conquerers start with one step at a time :) *

---

## Project Description

This repository contains my Screeps code, with which I gradually conquer the virtual world.  
The focus is on clean development, experimenting with new strategies, and steadily expanding my Screeps base.

---

## Branch Plan

To keep development organized and stable, I use the following branch workflow:

- **`main`**  
  Stable version actively running in the game. Only tested and finished features are merged here.

- **`tutorial`**  
  Contains the original tutorial code as a reference. This branch is not modified.

- **`develop`** *(optional)*  
  Integration branch for ongoing development and feature testing before merging into `main`.

- **`feature/<name>`**  
  Individual feature branches for new functions, e.g. `feature-road-builder` or `feature-tower-ai`.  
  Created from `develop` or `main` and merged back when done.

 - **`season/<year>`** *(optional)*  
  Snapshot branch capturing the state of the code for a specific Screeps season or major update.  
  Useful to preserve historical versions or restart from a known baseline.

---

## Getting Started

1. Clone the repo:  
   git clone https://github.com/yourname/Screeps-WorldConquerer.git

2. Work on 'main' for stable changes.

3. Create a new branch for features:
	git checkout -b feature/my-new-feature develop

4. Commit and push your changes regularly.

---

## Screeps Specifics
- Code is regularly deployed from main to go live in the game.
- Tutorials are kept separate in the tutorial branch for easy reference.

---

## Contact
If you have questions or ideas, feel free to open issues or reach out directly!

---

Let’s conquer the Screeps world — one step at a time!