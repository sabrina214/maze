const row = document.getElementById('row')
const rowField = document.getElementById('row-field')
const col = document.getElementById('col')
const colField = document.getElementById('col-field')
const grid = document.querySelector('.grid')
const createBtn = document.getElementById('create')
const solveBtn = document.getElementById('solve')

const wait = delay => new Promise(resolve => setTimeout(resolve, delay))

row.addEventListener('input', () => {
    const startX = document.getElementById('start-x')
    startX.minValue = row.value
    rowField.innerText = row.value

})

col.addEventListener('input', () => {
    colField.innerText = col.value
})

createBtn.addEventListener('click', async () => {
    console.clear()
    const numRows = parseInt(row.value)
    const numCols = parseInt(col.value)
    
    // create grid aka html table
    createGrid(numRows, numCols)

    const startX = parseInt(document.getElementById('start-x').value)
    const startY = parseInt(document.getElementById('start-y').value)
        
    let startCoord = { 'x': startX, 'y': startY }
    
    createBtn.setAttribute('disabled', true)
    await createMaze(numRows, numCols, startCoord)
    createBtn.disabled = false
    solveBtn.disabled = false
})

function createGrid(numRows, numCols) {
    grid.innerHTML = ''

    for (let i = 0; i < numRows; i++) {
        const rowToAdd = document.createElement('tr')
        for (let j = 0; j < numCols; j++) {
            const cell = document.createElement('td')
            cell.setAttribute('id', i * numCols + j)
            rowToAdd.appendChild(cell)
        }
        grid.appendChild(rowToAdd)
    }
}

async function createMaze(numRows, numCols, startCoord) {
    let visited = Array(numRows).fill(false).map(() => Array(numCols).fill(false))
    visited[startCoord.x][startCoord.y] = true

    let stack = [startCoord]
    let top = 0

    while (top != -1) {
        let curr = stack[top]
        let currCellId = curr.x * numCols + curr.y
        let currCell = document.getElementById(currCellId)
        currCell.style.backgroundColor = 'greenyellow'

        neighbors = getNeighboringCells(numRows, numCols, visited, curr)
            
        let next = null
        for (let i = 0; neighbors.length; i++) {
            let coord = neighbors[i]
            if (!visited[coord.x][coord.y]) {
                next = coord
                visited[next.x][next.y] = true
                
                let nextCellId = next.x * numCols + next.y
                nextCell = document.getElementById(nextCellId)
                
                removeBar(curr, next, currCell, nextCell)
                break
            }
        }
        if (!next) {
            top--
            stack.pop()
            currCell.style.backgroundColor = 'pink'
        } else {
            top++
            stack.push(next)
        }
        await wait(10)
    }
}

function getNeighboringCells(numRows, numCols, visited, coord) {
    // direction vectors
    const dr = [-1, 1, 0, 0]
    const dc = [0, 0, -1, 1]
    
    let candidates = []    
    let next

    for (let i = 0; i < 4; i++) {
        next = {'x': 0, 'y': 0}

        next.x = coord.x + dr[i]
        next.y = coord.y + dc[i]
        
        // check out of bounds
        if (next.x < 0 || next.y < 0) continue
        if (next.x >= numRows || next.y >= numCols) continue
        
        // skip if visited
        if (visited[next.x][next.y] === true) continue
        
        candidates.push(next)
    }
    return candidates.sort(() => Math.random() - 0.5)
}

function removeBar(coord_1, coord_2, cell_1, cell_2) {
    let { x: x1, y: y1 } = coord_1
    let { x: x2, y: y2 } = coord_2

    // same column
    if (y1 === y2) {
        if (x1 < x2) {
            cell_1.style.borderBottom = 'none'
            cell_2.style.borderTop = 'none'
        } else if (x1 > x2) {
            cell_1.style.borderTop = 'none'
            cell_2.style.borderBottom = 'none'
        }
    } else if (x1 === x2) { // same row
        if (y1 < y2) {
            cell_1.style.borderRight = 'none'
            cell_2.style.borderLeft = 'none'
        } else if (y1 > y2) {
            cell_1.style.borderLeft = 'none'
            cell_2.style.borderRight = 'none'
        }
    }
}

async function solveMaze() {
    let numRows = parseInt(row.value)
    let numCols = parseInt(col.value)

    const startX = parseInt(document.getElementById('start-x').value)
    const startY = parseInt(document.getElementById('start-y').value)
    const goalX = parseInt(document.getElementById('goal-x').value)
    const goalY = parseInt(document.getElementById('goal-y').value)

    let startCoord = { x: startX, y: startY }
    let goalCoord = { x: goalX, y: goalY }
    
    let visited = Array(numRows).fill(false).map(() => Array(numCols).fill(false))
    visited[startCoord.x][startCoord.y] = true
    
    let stack = [startCoord]
    let top = 0
    
    let reachedEnd = false
    let parent = { '0': null }
    
    while (top != -1) {
        let curr = stack[top]
        let currCellId = curr.x * numCols + curr.y
        let currCell = document.getElementById(currCellId)
        currCell.style.backgroundColor = 'greenyellow'

        if (JSON.stringify(curr) == JSON.stringify(goalCoord)) {
            reachedEnd = true
            break
        }

        neighbors = getNeighboringCellsForSolving(numRows, numCols, visited, curr, currCell)

        let next = null
        for (let i = 0; neighbors.length; i++) {
            let coord = neighbors[i]
            if (!visited[coord.x][coord.y]) {
                next = coord
                visited[next.x][next.y] = true

                let nextCellId = next.x * numCols + next.y
                nextCell = document.getElementById(nextCellId)

                parent[nextCellId] = currCellId
                removeBar(curr, next, currCell, nextCell)
                break
            }
        }
        if (!next) {
            top--
            stack.pop()
            currCell.style.backgroundColor = 'pink'
        } else {
            top++
            stack.push(next)
        }
        await wait(10)
    }
    if (reachedEnd) {
        reconstructPath(parent, goalCoord.x * numCols + goalCoord.y)
    }
}

function getNeighboringCellsForSolving(numRows, numCols, visited, coord, cell) {
    // direction vectors
    const dr = [-1, 1, 0, 0]
    const dc = [0, 0, -1, 1]
    const bars = ['top', 'bottom', 'left', 'right']

    let candidates = []
    let next

    const externalStyleForCell = window.getComputedStyle(cell)

    for (let i = 0; i < 4; i++) {
        next = { 'x': 0, 'y': 0 }

        next.x = coord.x + dr[i]
        next.y = coord.y + dc[i]

        // check out of bounds
        if (next.x < 0 || next.y < 0) continue
        if (next.x >= numRows || next.y >= numCols) continue

        // skip if visited
        if (visited[next.x][next.y] === true) continue
        
        // look out for neighboring cells which can't be visited due to walls
        let border = `border-${bars[i]}-style`
        if (externalStyleForCell.getPropertyValue(border).startsWith('none'))
            candidates.push(next)

    }
    return candidates.sort(() => Math.random() - 0.5)
}

async function reconstructPath(parent, cellId) {
    let cell
    while (parent[cellId] != null) {
        cell = document.getElementById(cellId)
        cell.style.backgroundColor = 'orange'
        cellId = parent[cellId]
        await wait(10)
    }
    cell = document.getElementById(cellId)
    cell.style.backgroundColor = 'orange'
}