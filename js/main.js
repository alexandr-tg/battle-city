function start(data){

    let {tanksData, fieldData, controlSettingsData} = data;

    showBattleInfo();
    drawField(fieldData, 'standardField');

    tankRender(tanksData.userMain.elem, fieldData.standardField.userMain);
    tankRender(tanksData.enemy.elem, fieldData.standardField.enemies[0]);
    tankRender(tanksData.enemy.elem, fieldData.standardField.enemies[1]);

    control(tanksData);
    intervals(tanksData, fieldData);
}

//Отрисовка разметки на боевом поле
function drawField (fieldData, fieldName) {
    //Отрисовка сетки
    let wrapper = document.querySelector('.wrapper');
    let field = document.createElement("div");
    field.classList.add('field');
    wrapper.appendChild(field);

    for(var i = 0; i < 225; i++){
        let point = `<div class="point" data-index="${i+1}"></div>`;
        field.innerHTML += point;
    }

    //Отрисовка блоков препятствий
    for (let key in fieldData[fieldName]) {
        if(key === 'brickWallPoints' || key === 'concreteWallPoints' || key === 'bushWallPoints' || key === 'base'){
            fieldData[fieldName][key].points.forEach(value => {
                    let point = document.querySelector(`div[data-index='${value}']`);
                    point.innerHTML = fieldData[fieldName][key].elem;
                });
        }
    }
    document.querySelector('.health-value').innerText = 3; //убрать хардкод
}

function tankRender(tankElem, spawnPoint){
        let point = document.querySelector(`div[data-index='${spawnPoint}']`);
        point.innerHTML += tankElem;
}

function enemyDirectionRandom(){
    let directions = [1, 2, 3, 4];
    return  directions[Math.floor(Math.random() * directions.length)];
}

function intervals(tanksData, fieldData){
    let health = 3;
    let score = 0;
    let fps = 1000 / 60;
    let verticalCounter = 0;
    let horizontalCounter = 0;
    let enemyGenerationDelay = 10000;
    let field = document.querySelector('.field');

    inter.run = setInterval(() => {
        if(tanksData.userMain.run){
            switch (tanksData.userMain.direction) {
                case 1:
                    tanksData.userMain.elem.setAttribute('src', '../img/tanks/mainPlayer/mainPlayerUp.png');
                    if(
                        tanksData.userMain.elem.offsetTop > 1 && !isWall(tanksData.userMain.direction, tanksData.userMain.elem, fieldData)
                    ) {
                        verticalCounter -= tanksData.userMain.speed;
                        tanksData.userMain.elem.style.top = `${verticalCounter}px`;
                    }
                    break;
                case 2:
                    tanksData.userMain.elem.setAttribute('src', '../img/tanks/mainPlayer/mainPlayerRight.png');
                    if(
                        tanksData.userMain.elem.offsetLeft < field.clientWidth - tanksData.userMain.elem.offsetWidth - 1 &&
                        !isWall(tanksData.userMain.direction, tanksData.userMain.elem, fieldData)
                    ){
                        horizontalCounter += tanksData.userMain.speed;
                        tanksData.userMain.elem.style.left = `${horizontalCounter}px`;
                    }
                    break;
                case 3:
                    tanksData.userMain.elem.setAttribute('src', '../img/tanks/mainPlayer/mainPlayerDown.png');
                    if(
                        tanksData.userMain.elem.offsetTop < field.clientHeight - tanksData.userMain.elem.offsetWidth + 4 &&
                        !isWall(tanksData.userMain.direction, tanksData.userMain.elem, fieldData)
                    ){
                        verticalCounter += tanksData.userMain.speed;
                        tanksData.userMain.elem.style.top = `${verticalCounter}px`;
                    }
                    break;
                case 4:
                    tanksData.userMain.elem.setAttribute('src', '../img/tanks/mainPlayer/mainPlayerLeft.png');
                    if(
                        tanksData.userMain.elem.offsetLeft > 1 &&
                        !isWall(tanksData.userMain.direction, tanksData.userMain.elem, fieldData)
                    ){
                        horizontalCounter -= tanksData.userMain.speed;
                        tanksData.userMain.elem.style.left = `${horizontalCounter}px`;
                    }
                    break;
            }
        }
    }, fps);
    inter.shell = setInterval(() => {
        let field = document.querySelector('.field');
        let shells = document.querySelectorAll('.shell');
        let enemyShells = document.querySelectorAll('.enemy-shell');
        let walls = document.querySelectorAll('.wall');

        shells.forEach(shell => {
            let direction = shell.getAttribute('direction');

                wallCrash(shell, walls);

            if(
                shell.offsetLeft > field.clientWidth - shell.offsetWidth - 1 ||
                shell.offsetTop > field.clientHeight - shell.offsetWidth + 4 ||
                shell.offsetLeft < 1 ||
                shell.offsetTop < 0
            ) {
                shell.parentNode.removeChild(shell);
            }

            switch (Number.parseInt(direction)){
                case 1:
                    shell.style.top = shell.offsetTop - 8 + 'px';
                    break;
                case 2:
                    shell.style.left = shell.offsetLeft + 8 + 'px';
                    break;
                case 3:
                    shell.style.top = shell.offsetTop + 8 + 'px';
                    break;
                case 4:
                    shell.style.left = shell.offsetLeft - 8 + 'px';
            }
        });

        enemyShells.forEach(shell => {
            let direction = shell.getAttribute('direction');
            wallCrash(shell, walls);
            if(['4', '2', '1'].includes(direction)) {
                if(
                    shell.getBoundingClientRect().top < tanksData.userMain.elem.getBoundingClientRect().bottom &&
                    shell.getBoundingClientRect().bottom > tanksData.userMain.elem.getBoundingClientRect().top &&
                    shell.getBoundingClientRect().right > tanksData.userMain.elem.getBoundingClientRect().left &&
                    shell.getBoundingClientRect().left < tanksData.userMain.elem.getBoundingClientRect().right
                ){
                    health--;
                    tanksData.userMain.elem.parentNode.removeChild(tanksData.userMain.elem);
                    shell.parentNode.removeChild(shell);
                }
            } else {
                if(
                    shell.getBoundingClientRect().bottom > tanksData.userMain.elem.getBoundingClientRect().top &&
                    shell.getBoundingClientRect().right > tanksData.userMain.elem.getBoundingClientRect().left &&
                    shell.getBoundingClientRect().left < tanksData.userMain.elem.getBoundingClientRect().right
                ){
                    health--;
                    tanksData.userMain.elem.parentNode.removeChild(tanksData.userMain.elem);
                    shell.parentNode.removeChild(shell);
                }
            }
            document.querySelector('.health-value').innerText = health;
            // Вызов функции возраждения главного танка

            if(
                shell.offsetLeft > field.clientWidth - shell.offsetWidth - 1 ||
                shell.offsetTop > field.clientHeight - shell.offsetWidth + 4 ||
                shell.offsetLeft < 1 ||
                shell.offsetTop < 0
            ) {
                shell.remove();
            }

            switch (Number.parseInt(direction)){
                case 1:
                    shell.style.top = shell.offsetTop - 8 + 'px';
                    break;
                case 2:
                    shell.style.left = shell.offsetLeft + 8 + 'px';
                    break;
                case 3:
                    shell.style.top = shell.offsetTop + 8 + 'px';
                    break;
                case 4:
                    shell.style.left = shell.offsetLeft - 8 + 'px';
            }
        });
    }, fps);
    inter.enemy = setInterval(() => {
        let enemies = document.querySelectorAll('.enemy');
        enemies.forEach(enemy => {
            let shells = document.querySelectorAll('.shell');
            shells.forEach(shell => {

                let direction = shell.getAttribute('direction');
                if(['4', '2', '1'].includes(direction)) {
                    if(
                        shell.getBoundingClientRect().top < enemy.getBoundingClientRect().bottom &&
                        shell.getBoundingClientRect().bottom > enemy.getBoundingClientRect().top &&
                        shell.getBoundingClientRect().right > enemy.getBoundingClientRect().left &&
                        shell.getBoundingClientRect().left < enemy.getBoundingClientRect().right
                    ){
                        score++;
                        enemy.parentNode.removeChild(enemy);
                        shell.parentNode.removeChild(shell);
                    }
                } else {
                    if(
                        shell.getBoundingClientRect().bottom > enemy.getBoundingClientRect().top &&
                        shell.getBoundingClientRect().right > enemy.getBoundingClientRect().left &&
                        shell.getBoundingClientRect().left < enemy.getBoundingClientRect().right
                    ){
                        score++;
                        enemy.parentNode.removeChild(enemy);
                        shell.parentNode.removeChild(shell);
                    }
                }
                document.querySelector('.score-value').innerText = score;
            });


            let directionEnemy = enemy.getAttribute('direction');
            switch (Number.parseInt(directionEnemy)) {
                case 1:
                    enemy.src = '../img/tanks/enemies/medium-enemy-top.png';
                    if(enemy.offsetTop > 1 && !isWall(directionEnemy, enemy, fieldData)){
                        enemy.style.top = enemy.offsetTop - tanksData.enemy.speed + 'px';
                    } else {
                        enemy.setAttribute('direction', enemyDirectionRandom());
                    }
                    break;
                case 2:
                    enemy.src = '../img/tanks/enemies/medium-enemy-right.png';
                    if(enemy.offsetLeft < field.clientWidth - enemy.offsetWidth - 1 && !isWall(directionEnemy, enemy, fieldData)){
                        enemy.style.left = enemy.offsetLeft + tanksData.enemy.speed + 'px';
                    } else {
                        enemy.setAttribute('direction', enemyDirectionRandom());
                    }
                    break;
                case 3:
                    enemy.src = '../img/tanks/enemies/medium-enemy-bottom.png';
                    if(enemy.offsetTop < field.clientHeight - enemy.offsetWidth + 4 && !isWall(directionEnemy, enemy, fieldData)){
                        enemy.style.top = enemy.offsetTop + tanksData.enemy.speed + 'px';
                    } else {
                        enemy.setAttribute('direction', enemyDirectionRandom());
                    }
                    break;
                case 4:
                    enemy.src = '../img/tanks/enemies/medium-enemy-left.png';
                    if(enemy.offsetLeft > 1 && !isWall(directionEnemy, enemy, fieldData)){
                        enemy.style.left = enemy.offsetLeft - tanksData.enemy.speed + 'px';
                    } else {
                        enemy.setAttribute('direction', enemyDirectionRandom());
                    }
            }

        });
    }, fps);
    inter.generateEnemy = setInterval(() => {
        tankRender(tanksData.enemy.elem, fieldData.standardField.enemies[0]);
        tankRender(tanksData.enemy.elem, fieldData.standardField.enemies[1]);
    }, enemyGenerationDelay);
    inter.enemyShoot = setInterval(() => {
        let enemies = document.querySelectorAll('.enemy');
        enemies.forEach(enemy => {
           enemyShoot(enemy, tanksData);
        });
    }, 1000);
    inter.changeEnemyDirection = setInterval(() => {
        let enemies = document.querySelectorAll('.enemy');
        enemies.forEach(enemy => {
            enemy.setAttribute('direction', enemyDirectionRandom());
        })
    }, 2500)
}

function isWall(direction, target, fieldData){
    let allPoints = [...fieldData.standardField.brickWallPoints.points, ...fieldData.standardField.concreteWallPoints.points];
    let nextPoint;
    let point = document.querySelector('.point').getBoundingClientRect().width;
    let halfOfPoint = point / 2;
    switch (Number.parseInt(direction)) {
        case 1:
            nextPoint = document.elementFromPoint(target.getBoundingClientRect().x + halfOfPoint, target.getBoundingClientRect().y - 3);
            break
        case 2:
            nextPoint = document.elementFromPoint(target.getBoundingClientRect().x + point, target.getBoundingClientRect().y + halfOfPoint);
            break
        case 3:
            nextPoint = document.elementFromPoint(target.getBoundingClientRect().x + halfOfPoint, target.getBoundingClientRect().y + point);
            break
        case 4:
            nextPoint = document.elementFromPoint(target.getBoundingClientRect().x - 3, target.getBoundingClientRect().y + halfOfPoint)
    }
    return allPoints.includes(parseInt(nextPoint.parentNode.getAttribute('data-index')));
}
function wallCrash(shell, walls){
    walls.forEach(wall => {
        if(
            shell.getBoundingClientRect().top < wall.getBoundingClientRect().bottom &&
            shell.getBoundingClientRect().bottom > wall.getBoundingClientRect().top &&
            shell.getBoundingClientRect().right > wall.getBoundingClientRect().left &&
            shell.getBoundingClientRect().left < wall.getBoundingClientRect().right
        ){
            if(Array.from(wall.classList).includes('base')) showGameOverMenu('The base has been destroyed');
            if(Array.from(wall.classList).includes('brick-elem')) wall.remove();
            shell.remove();
        }
    });
}
function shoot(tanksData){
    let tank = document.getElementById('userMain');
    let field = document.querySelector('.field');

    switch (tanksData.userMain.direction){
        case 1:
            field.innerHTML += `<img class="shell" direction="1" src="img/actionElements/shell-top.png" style="left: ${tank.offsetLeft + 21}px; top: ${tank.offsetTop - 19}px">`;
            break;
        case 2:
            field.innerHTML += `<img class="shell" direction="2" src="img/actionElements/shell-right.png" style="left: ${tank.offsetLeft + 61}px; top: ${tank.offsetTop + 18}px">`;
            break;
        case 3:
            field.innerHTML += `<img class="shell" direction="3" src="img/actionElements/shell-bottom.png" style="left: ${tank.offsetLeft + 21}px; top: ${tank.offsetTop + 55}px">`;
            break;
        case 4:
            field.innerHTML += `<img class="shell" direction="4" src="img/actionElements/shell-left.png" style="left: ${tank.offsetLeft - 19}px; top: ${tank.offsetTop + 18}px">`;
            break;
    }


    tanksData.userMain.elem = document.getElementById('userMain');
    tanksData.enemy.elem = tanksData.enemy.elem;
}
function enemyShoot(enemy, tanksData){
    let field = document.querySelector('.field');
    let direction = enemy.getAttribute('direction');
    switch (Number.parseInt(direction)){
        case 1:
            field.innerHTML += `<img class="enemy-shell" direction="1" src="img/actionElements/shell-top.png" style="left: ${parseInt(enemy.style.left) + 21}px; top: ${parseInt(enemy.style.top) - 19}px">`;
            break;
        case 2:
            field.innerHTML += `<img class="enemy-shell" direction="2" src="img/actionElements/shell-right.png" style="left: ${parseInt(enemy.style.left) + 61}px; top: ${parseInt(enemy.style.top) + 18}px">`;
            break;
        case 3:
            field.innerHTML += `<img class="enemy-shell" direction="3" src="img/actionElements/shell-bottom.png" style="left: ${parseInt(enemy.style.left) + 21}px; top: ${parseInt(enemy.style.top) + 55}px">`;
            break;
        case 4:
            field.innerHTML += `<img class="enemy-shell" direction="4" src="img/actionElements/shell-left.png" style="left: ${parseInt(enemy.style.left) - 19}px; top: ${parseInt(enemy.style.top) + 18}px">`;
    }


    tanksData.userMain.elem = document.getElementById('userMain');
    tanksData.enemy.elem = tanksData.enemy.elem;
}

function clearAllIntervals(intervals){
    for (let key in intervals) clearInterval(intervals[key]);
}

// *** Sound ***
function soundMove(sound, soundStop){
    soundStop.pause();
    sound.volume = 0.1;
    sound.play();
}

function soundStop(sound, soundMove){
    soundMove.pause();
    sound.currentTime = 0;
    sound.volume = 0.1;
    sound.play();
}

// *** Listeners ***
function addStartListener(action) {
    let start = document.getElementById('start');
    start.addEventListener('click', action);
}

function addRestartListener(action){
    let restart = document.getElementById('restart');
    restart.addEventListener('click', action);
}

function addExitListener(action){
    let exit = document.getElementById('exit');
    exit.addEventListener('click', action);
}

function control(tanksData){
    let soundM = document.querySelector('.sound-move');
    let soundS = document.querySelector('.sound-stop');
    document.addEventListener('keydown', (e) => {
        switch (e.keyCode) {
            case 38:
                tanksData.userMain.run = true;
                tanksData.userMain.direction = 1;
                soundMove(soundM, soundS);
                break;
            case 40:
                tanksData.userMain.run = true;
                tanksData.userMain.direction = 3;
                soundMove(soundM, soundS);
                break;
            case 37:
                tanksData.userMain.run = true;
                tanksData.userMain.direction = 4;
                soundMove(soundM, soundS);
                break;
            case 39:
                tanksData.userMain.run = true;
                tanksData.userMain.direction = 2;
                soundMove(soundM, soundS);
                break;
            case 17:
                shoot(tanksData);
        }
    });

    document.addEventListener('keyup', (e) => {
        if([37, 38, 39, 40].includes(e.keyCode)) tanksData.userMain.run = false;
        soundStop(soundS, soundM);
    });
}

// *** Interface ***

function showMainMenu() {
    let wrapper = document.querySelector('.wrapper');
    let input = `<div class="main-menu">
            <div class="main-menu-info">
                    <span>Battle City</span>
                    <span class="game-over-reason"></span>
                    <button id="start">Start</button>
            </div>
            <div class="bg-blur-menu"></div>
        </div>`;
    wrapper.innerHTML = input;

    addStartListener(restart);
}

function showGameOverMenu(reason){
    let wrapper = document.querySelector('.wrapper');
    let input = `<div class="game-over">
            <div class="game-over-info">
                <div>
                    <span>Game Over</span>
                    <span class="game-over-reason">${reason}</span>
                    <button id="restart">Restart</button>
                    <button id="exit">Exit</button>
                </div>
            </div>
            <div class="bg-blur-menu"></div>
        </div>`;
    wrapper.innerHTML = input;

    addRestartListener(restart);
    addExitListener(exit);
}

function showBattleInfo() {
    let wrapper = document.querySelector('.wrapper');
    let input = `<div class="info">
            <span class="health">Health: <span class="health-value">3</span></span>
            <br>
            <span class="score">Score: <span class="score-value">0</span></span>
        </div>`;
    wrapper.innerHTML += input;
}

function restart(){
    let wrapper = document.querySelector('.wrapper');
    wrapper.innerHTML = '';
    clearAllIntervals(inter);
    start();
}
function exit(){
    showMainMenu();
}


(function (){
    fetch('./json/data.json')
        .then(resp => resp.json())
        .then(data => start(data))
        .catch(e => console.log(e));
}())

let inter = {
    run: true,
    shell: false,
    enemy: false,
    generateEnemy: false,
    walls: false,
    enemyShoot: false,
    changeEnemyDirection: false
}