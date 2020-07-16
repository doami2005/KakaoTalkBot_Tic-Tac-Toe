const Stone = '□';
const P_Stones = ['O', 'X'];

let T3 = {
    'Start' : false,
    'Players' : [],
    'Board' : Array(3).fill().map(_ => Array(3).fill(Stone))
};

function response(room, msg, sender, igc, replier) {
    if (msg.startsWith('/틱택토')) {
        let input = msg.substring(4).trim();
        switch (input) {
            case '' :
                replier.reply([
                '[ 틱택토 ]',
                '/틱택토 생성',
                '/틱택토 참가',
                '/틱택토 종료',
                ].join('\n'));
                break;
            case '생성' :
                if (T3.Start) {
                    replier.reply('• 게임이 이미 시작되었습니다!');
                    return;
                }
                if (T3.Players.length) {
                    replier.reply('• 방이 이미 생성되었습니다!');
                    return;
                }
                T3.Players.push(sender);
                replier.reply('• 틱택토 방이 생성되었습니다!\n\n[ 참가 인원 ]\n1. '+sender);
                break;
            case '참가' :
                if (!T3.Players.length) {
                    replier.reply('• 생성된 방이 없습니다!');
                    return;
                }
                if (T3.Players.indexOf(sender) != -1) {
                    replier.reply('• 이미 참가하셨습니다!');
                    return;
                }
                T3.Players.push(sender);
                replier.reply([
                '• '+sender+' 님이 참가하셨습니다!',
                '게임을 시작합니다.\n',
                '[ 참가 인원 ]',
                T3.Players.map((e, i) => (i+1)+'. '+e+' : '+P_Stones[i]).join("\n")
                ].join('\n'));
                if (T3.Players.length != 2) return;
                T3.Start = true;
                T3.Turn = T3.Players[Math.random() * 2 | 0];
                replier.reply('• '+T3.Turn + ' 님의 차례입니다!\n/x, y 형식으로 입력해 주세요.');
                break;
            case '종료' :
                if (!T3.Players.length) {
                    replier.reply('• 게임이 이미 종료되었습니다!');
                    return;
                }
                if (T3.Players.indexOf(sender) == -1) return;
                Reset();
                replier.reply('• 게임이 종료되었습니다!');
                break;
            default:
                replier.reply('• 잘못된 명령어 입니다.');
        }
    }
    if (T3.Start && T3.Turn == sender) {
        if (msg[0] != '/' || msg[2] != ',') return;
        let x = Number(msg[1]);
        let y = Number(msg.substring(3).trim());
        if (isNaN(x) || isNaN(y) || x < 1 || x > 9 || y < 1 || y > 9) {
            replier.reply('• 잘못된 표기 형식 입니다!');
            return;
        }
        if (T3.Board[y-1][x-1] != Stone) {
            replier.reply('• 그곳엔 돌을 놓을 수 없습니다!');
            return;
        }
        let P_Stone = P_Stones[T3.Players.indexOf(T3.Turn)];
        T3.Board[y-1][x-1] = P_Stone;
        replier.reply(Combine(T3.Board));
        let Result = CheckWinner();
        if (Result !== null) {
            if (Result == 0 || Result == 1) {
                replier.reply('• '+T3.Players[Result]+' 님의 승리입니다!');
            } else if (Result == 'D') {
                replier.reply('• 무승부 입니다!');
            }
            Reset();
            return;
        }
        T3.Turn = T3.Players[(T3.Players.indexOf(T3.Turn) + 1) % 2];
        replier.reply('• '+T3.Turn+' 님의 차례입니다.');
    }
}

const Lines = [
[[1, 1], [2, 1], [3, 1]],
[[1, 2], [2, 2], [3, 2]],
[[1, 3], [2, 3], [3, 3]],
[[1, 1], [1, 2], [1, 3]],
[[2, 1], [2, 2], [2, 3]],
[[3, 1], [3, 2], [3, 3]],
[[1, 1], [2, 2], [3, 3]],
[[3, 1], [2, 2], [1, 3]]
];

function Combine (Board) {
    return Board.map(e => e.join('')).join('\n');
}

function CheckWinner () {
    let Line = '';
    let Result = '';
    Lines.forEach(e => {
        e.forEach(r => Line += T3.Board[r[1]-1][r[0]-1]);
        P_Stones.forEach((r, i) => {
            if (Line == r.repeat(3)) Result = i;
        });
        Line = '';
    });
    if (Result === 0 || Result === 1) return Result;
    let Map = T3.Board.map(e => e.join('')).join('');
    if (!Map.includes(Stone)) return 'D';
    return null;
}

function Reset () {
    T3 = {
        'Start' : false,
        'Player' : [],
        'Board' : Array(3).fill().map(_ => Array(3).fill(Stone))
    };
}
