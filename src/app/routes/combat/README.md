Combat Simulation
---

The combat is turn-based and inspired by the original Final Fantasy game. It collects all player and enemy 
moves, then executes them and repeats until someone has escaped, all enemies are defeated, or all party members
are defeated.

## State Machine Diagram

The basic logic for the combat simulation is expressed in the following diagram. It is worth noting
that this diagram excludes the details of how player actions are chosen, and the effects of individual
user actions during the simulation. Each of these are worthy of their own discussion or diagram and are
noted in green.

![Combat State Machine](./combat-state-machine.png?raw=true "Combat State Machine")

