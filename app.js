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
    const goalX = document.getElementById('goal-x')
    startX.max = goalX.max = goalX.value = row.value - 1
    rowField.innerText = row.value
})

col.addEventListener('input', () => {
    const startY = document.getElementById('start-y')
    const goalY = document.getElementById('goal-y')
    startY.max = goalY.max = goalY.value = col.value - 1
    colField.innerText = col.value
})

createBtn.addEventListener('click', async () => {
    console.clear()
    createBtn.setAttribute('disabled', true)
    solveBtn.disabled = true

    const numRows = parseInt(row.value)
    const numCols = parseInt(col.value)

    // create grid aka html table
    createGrid(numRows, numCols)

    const startX = parseInt(document.getElementById('start-x').value)
    const startY = parseInt(document.getElementById('start-y').value)

    const startCoord = { 'x': startX, 'y': startY }

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

            let cellCoordToolTip = document.createElement("span")
            cellCoordToolTip.innerText = `${i}, ${j}`
            cell.classList.add(['tooltip'])
            cellCoordToolTip.classList.add(['tooltiptext'])
            cell.appendChild(cellCoordToolTip)

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
        currCell.style.backgroundColor = 'rgb(85, 255, 245)'

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
            currCell.style.backgroundColor = 'rgb(255, 217, 223)'
        } else {
            top++
            stack.push(next)
        }
        await wait(10)
    }
    document.getElementById(startCoord.x * numCols + startCoord.y).style.backgroundColor = 'rgb(109, 23, 229)'
}

function getNeighboringCells(numRows, numCols, visited, coord) {
    // direction vectors
    const dr = [-1, 1, 0, 0]
    const dc = [0, 0, -1, 1]

    let candidates = []
    let next

    for (let i = 0; i < 4; i++) {
        next = { 'x': 0, 'y': 0 }

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

solveBtn.addEventListener('click', async () => {
    solveBtn.setAttribute('disabled', true)
    createBtn.setAttribute('disabled', true)

    const numRows = parseInt(row.value)
    const numCols = parseInt(col.value)

    const startX = parseInt(document.getElementById('start-x').value)
    const startY = parseInt(document.getElementById('start-y').value)
    const goalX = parseInt(document.getElementById('goal-x').value)
    const goalY = parseInt(document.getElementById('goal-y').value)

    const startCoord = { x: startX, y: startY }
    const goalCoord = { x: goalX, y: goalY }

    await solveMaze(numRows, numCols, startCoord, goalCoord)

    solveBtn.disabled = false
    createBtn.disabled = false
})

async function solveMaze(numRows, numCols, startCoord, goalCoord) {
    repaintCells()

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
            currCell.style.backgroundColor = 'yellow'
        } else {
            top++
            stack.push(next)
        }
        await wait(10)
    }
    if (reachedEnd) {
        document.getElementById(startCoord.x * numCols + startCoord.y).style.backgroundColor = 'rgb(103, 29, 223)'
        await reconstructPath(parent, goalCoord.x * numCols + goalCoord.y)
        document.getElementById(goalCoord.x * numCols + goalCoord.y).style.backgroundColor = 'rgb(223, 29, 142)'
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
    while (parent[cellId] != null) {
        document.getElementById(cellId).style.backgroundColor = 'orange'
        cellId = parent[cellId]
        await wait(10)
    }
}

function repaintCells() {
    document.querySelectorAll('td').forEach(cell => {
        cell.style.backgroundColor = 'rgb(255, 217, 223)'
    })
}