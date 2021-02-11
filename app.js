const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600, height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine,
    options: {
        wireframes: true,
        width, //px
        height //px
    },
});

Render.run(render);
Runner.run(Runner.create(), engine);


//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 40, width, { isStatic: true })
];
World.add(world, walls);

// Maze generation
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const grid = Array(cells).fill(null).map(() => Array(cells).fill(false));
const verticals = Array(cells).fill(null).map(() => Array(cells - 1).fill(false));
const horizontals = Array(cells - 1).fill(null).map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    //If i have visited the cell at [row,col] return
    if (grid[row][column]) return;
    // Mark this cell as visited
    grid[row][column] = true;
    // Assemble randomly ordered list of neighbours
    const neighbours = shuffle([[row - 1, column, 'up'], [row, column + 1, 'right'], [row + 1, column, 'down'], [row, column - 1, 'left']]);
    // for each neighbour
    for (let neighbour of neighbours) {
        const [nextRow, nextColumn, direction] = neighbour;
        // See if neighbour is out of bounds
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) continue;
        // if we have visited that neighbour, continue to next neighbour
        if(grid[nextRow][nextColumn]) continue;
        // remove the wall from either from vertical or horizontal
        if(direction==='left') verticals[row][column-1] = true;
        else if(direction==='right') verticals[row][column] = true;
        else if(direction==='up') horizontals[row-1][column] = true;
        else if(direction==='down') horizontals[row][column] = true;
        // Visit the next cell
        stepThroughCell(nextRow,nextColumn);
    }
}
stepThroughCell(startRow, startColumn);

