var components = {
  num_of_rows : 12,
  num_of_cols : 24,
  num_of_bombs : 55,
  bomb : '💣',
  alive : true,
  colors : {1: 'pink', 2: 'green', 3: 'red', 4: 'purple', 5: 'maroon', 6: 'turquoise', 7: 'black', 8: 'grey'},
  bombProbability: 0.2,
  maxProbability: 0.8
}

function startGame() {
  components.bombs = placeBombs();
  document.getElementById('field').appendChild(createTable());
}

function changeDifficulty() {
  var difficultySelect = document.getElementById("difficulty");
  var selectedDifficulty = difficultySelect.value;

  if (selectedDifficulty === "easy") {
    components.num_of_rows = 8;
    components.num_of_cols = 8;
    components.num_of_bombs = 10;
  } else if (selectedDifficulty === "medium") {
    components.num_of_rows = 12;
    components.num_of_cols = 12;
    components.num_of_bombs = 20;
  } else if (selectedDifficulty === "expert") {
    components.num_of_rows = 16;
    components.num_of_cols = 16;
    components.num_of_bombs = 40;
  }

  var oldTable = document.getElementById("field").querySelector("table");
  if (oldTable) {
    oldTable.remove();
  }

  startGame();
}

function placeBombs() {
  var i, rows = [];

  for (i = 0; i < components.num_of_rows; i++) {
    rows[i] = [];
    for (var j = 0; j < components.num_of_cols; j++) {
      if (Math.random() < components.bombProbability) { 
        rows[i][j] = true;
        components.num_of_bombs++; 
      } else {
        rows[i][j] = false;
      }
    }
  }
  return rows;
}
function restartGame() {
  components.bombs = null;
  components.num_of_bombs = 0;
  components.alive = true;

  var oldTable = document.getElementById("field").querySelector("table");
  if (oldTable) {
    oldTable.remove();
  }

  startGame();
}

function placeSingleBomb(bombs) {

  var nrow, ncol, row, col;
  nrow = Math.floor(Math.random() * components.num_of_rows);
  ncol = Math.floor(Math.random() * components.num_of_cols);
  row = bombs[nrow];
  
  if (!row) {
      row = [];
      bombs[nrow] = row;
  }
  
  col = row[ncol];
  
  if (!col) {
      row[ncol] = true;
      return
  } 
  else {
      placeSingleBomb(bombs);
  }
}

function cellID(i, j) {
  return 'cell-' + i + '-' + j;
}

function createTable() {
  var table, row, td, i, j;
  table = document.createElement('table');
  
  for (i=0; i<components.num_of_rows; i++) {
      row = document.createElement('tr');
      for (j=0; j<components.num_of_cols; j++) {
          td = document.createElement('td');
          td.id = cellID(i, j);
          row.appendChild(td);
          addCellListeners(td, i, j);
      }
      table.appendChild(row);
  }
  return table;
}

function addCellListeners(td, i, j) {
  td.addEventListener('mousedown', function(event) {
      if (!components.alive) {
          return;
      }
      components.mousewhiches += event.which;
      if (event.which === 3) {
          return;
      }
      if (this.flagged) {
          return;
      }
      this.style.backgroundColor = 'lightGrey';
  });

  td.addEventListener('mouseup', function(event) {
    
      if (!components.alive) {
          return;
      }

      if (this.clicked && components.mousewhiches == 4) {
          performMassClick(this, i, j);
      }

      components.mousewhiches = 0;
      
      if (event.which === 3) {
         
          if (this.clicked) {
              return;
          }
          if (this.flagged) {
              this.flagged = false;
              this.textContent = '';
          } else {
              this.flagged = true;
              this.textContent = components.flag;
          }

          event.preventDefault();
          event.stopPropagation();
        
          return false;
      } 
      else {
          handleCellClick(this, i, j);
      }
  });

  td.oncontextmenu = function() { 
      return false; 
  };
}

function handleCellClick(cell, i, j) {
  if (!components.alive) {
      return;
  }

  if (cell.flagged) {
      return;
  }

  cell.clicked = true;

  if (components.bombs[i][j]) {
      cell.style.color = 'red';
      cell.textContent = components.bomb;
      gameOver();
      
  }
  else {
      cell.style.backgroundColor = 'lightGrey';
      num_of_bombs = adjacentBombs(i, j);
      if (num_of_bombs) {
          cell.style.color = components.colors[num_of_bombs];
          cell.textContent = num_of_bombs;
      } 
      else {
          clickAdjacentBombs(i, j);
      }
  }
}

function adjacentBombs(row, col) {
  var i, j, num_of_bombs;
  num_of_bombs = 0;

  for (i=-1; i<2; i++) {
      for (j=-1; j<2; j++) {
          if (components.bombs[row + i] && components.bombs[row + i][col + j]) {
              num_of_bombs++;
          }
      }
  }
  return num_of_bombs;
}

function adjacentFlags(row, col) {
  var i, j, num_flags;
  num_flags = 0;

  for (i=-1; i<2; i++) {
      for (j=-1; j<2; j++) {
          cell = document.getElementById(cellID(row + i, col + j));
          if (!!cell && cell.flagged) {
              num_flags++;
          }
      }
  }
  return num_flags;
}

function clickAdjacentBombs(row, col) {
  var i, j, cell;
  
  for (i=-1; i<2; i++) {
      for (j=-1; j<2; j++) {
          if (i === 0 && j === 0) {
              continue;
          }
          cell = document.getElementById(cellID(row + i, col + j));
          if (!!cell && !cell.clicked && !cell.flagged) {
              handleCellClick(cell, row + i, col + j);
          }
      }
  }
}

function performMassClick(cell, row, col) {
  if (adjacentFlags(row, col) === adjacentBombs(row, col)) {
      clickAdjacentBombs(row, col);
  }
}

function gameOver() {
  components.alive = false;
  document.getElementById('lost').style.display="block";
  
}

function reload(){
  window.location.reload();
}

window.addEventListener('load', function() {
  document.getElementById('lost').style.display="none";
  startGame();
});
var bombProbabilityInput = document.getElementById("bombProbability");
var maxProbabilityInput = document.getElementById("maxProbability");

bombProbabilityInput.value = components.bombProbability;
maxProbabilityInput.value = components.maxProbability;

bombProbabilityInput.addEventListener("input", function () {
  var enteredBombProbability = parseFloat(bombProbabilityInput.value);

  if (enteredBombProbability > components.maxProbability) {
    alert("Bomb Probability nu poate depasi Max Probability!");
    bombProbabilityInput.value = components.maxProbability;
  } else if (enteredBombProbability < 0) {
    bombProbabilityInput.value = 0;
  }
  components.bombProbability = parseFloat(bombProbabilityInput.value);
});

maxProbabilityInput.addEventListener("input", function () {
  var enteredMaxProbability = parseFloat(maxProbabilityInput.value);
  if (enteredMaxProbability < components.bombProbability) {
    maxProbabilityInput.value = components.bombProbability;
  }
  components.maxProbability = parseFloat(maxProbabilityInput.value);
});
