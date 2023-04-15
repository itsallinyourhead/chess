// Select corresponding option in overlay for saved color scheme in local storage or standard scheme.
if ('string' === typeof localStorage.getItem('boardColor')
&& !isNaN(parseInt(value = localStorage.getItem('boardColor')))) {
  for (let i = 0, j = document.querySelectorAll('.settingsBoardColor'); i < j.length; ++i) {
    if (value === j[i].getAttribute('data-color')) {
      j[i].checked = true;
      break;
    }
  }
} else {
  document.querySelectorAll('.settingsBoardColor')[0] && (document.querySelectorAll('.settingsBoardColor')[0].checked = true);
}
// Add event listener to all color scheme options in overlay.
for (let i = 0, j = document.querySelectorAll('.settingsBoardColor'); i < j.length; ++i) {
  j[i].addEventListener('click', BoardColor);
}
// Select corresponding option in overlay for saved degree in local storage or standard degree.
if ('string' === typeof localStorage.getItem('boardDegree')
&& !isNaN(parseInt(value = localStorage.getItem('boardDegree')))) {
  for (let i = 0, j = document.querySelectorAll('.settingsPosition'); i < j.length; ++i) {
    if (value === j[i].getAttribute('data-deg')) {
      j[i].checked = true;
      break;
    }
  }
} else {
  document.querySelectorAll('.settingsPosition')[0] && (document.querySelectorAll('.settingsPosition')[0].checked = true);
}
// Add event listener to all degree options in overlay.
for (let i = 0, j = document.querySelectorAll('.settingsPosition'); i < j.length; ++i) {
  j[i].addEventListener('click', BoardDegree);
}
// Choose game mode: online or offline.
function ChooseMode() {
  // Add event listener to start game button according to game mode.
  if (document.getElementById('startGame')) {
    document.getElementById('startGame').removeEventListener('click', 'online' === this.value ? StartGameOffline : StartGame);
    document.getElementById('startGame').addEventListener('click', 'online' === this.value ? StartGame : StartGameOffline);
  }
  // Enable figure color options if game mode is online. Disable figure color options if game mode is offline.
  for (let elem = document.getElementById('chooseColorOuter').getElementsByTagName('input'), i = 0; i < elem.length; ++i) {
    'online' === this.value ? elem[i].removeAttribute('disabled') : elem[i].setAttribute('disabled', 'disabled');
  }
}
// Add event listener to game mode options.
for (let i = 0, j = document.getElementsByName('chooseMode'); i < j.length; ++i) {
  j[i].addEventListener('click', ChooseMode);
}
// Display or hide overlay if space bar or enter key is pressed while focusing settings-label or close-overlay-label.
function OverlayDisplay(e) {
  (13 === e.which || 32 === e.which) && document.getElementById('overlayDisplay') && document.getElementById('overlayDisplay').click();
}
document.getElementById('overlayLabel') && document.getElementById('overlayLabel').addEventListener('keyup', OverlayDisplay);
document.getElementById('overlayCloseInput') && document.getElementById('overlayCloseInput').addEventListener('keyup', OverlayDisplay);
// Display or hide start new game button.
function NewGame() {
  if (this.checked) {
    for (let i = 0, elem = document.getElementById('chooseOuter').getElementsByTagName('input'); i < elem.length; ++i) {
      !('undefined' !== typeof mode && 'offline' === mode && 'chooseColor' === elem[i].name) && elem[i].removeAttribute('disabled');
    }
    ClassList(document.getElementById('startGameWarning'), new URLSearchParams(location.search).get('token') ? 'remove' : 'add', 'hidden');
    ClassList(document.getElementById('chooseOuter'), 'remove', 'none');
  } else {
    ClassList(document.getElementById('chooseOuter'), 'add', 'none');
  }
}
// Add event listener to Show-Start-Game-Button in overlay.
document.getElementById('settingsStartGame') && document.getElementById('settingsStartGame').addEventListener('click', NewGame);
// Display or hide invitation link.
function SettingsInvitationLink() {
  if (this.checked) {
    ClassList(document.getElementById('invitationLinkOuter'), 'remove', 'none');
  } else {
    ClassList(document.getElementById('invitationLinkOuter'), 'add', 'none');
  }
}
// Add event listener to Show-Invitation-Link in overlay.
document.getElementById('settingsInvitationLink') && document.getElementById('settingsInvitationLink').addEventListener('click', SettingsInvitationLink);
// Close overlay if visible.
function OverlayClose() {
  document.getElementById('overlayBackground') && 'visible' === getComputedStyle(document.getElementById('overlayBackground')).visibility && document.getElementById('overlayLabel') && document.getElementById('overlayLabel').click();
}
// Close websocket connection if open and ready.
function WSClose() {
  'undefined' !== typeof WS && 1 === WS.readyState && WS.close();
}
// Cloase overlay before leaving page.
window.addEventListener('beforeunload', OverlayClose);
// Close websocket connection before leaving page.
window.addEventListener('beforeunload', WSClose);
// Reset global variables when page loads or starting a new game.
function Reset() {
  History = [];
  Marked = [];
  MoveId = 0;
  Places = '                                                                ';
  CastleBlackLeft = CastleBlackRight = CastleWhiteLeft = CastleWhiteRight = 1;
}
Reset();
// Test if player is in check.
function Check(params) {
  let ColorTest = params.ColorTest,   // which player to test for check status
      Figure = params.Figure,         // which figure was moved
      NewId = params.NewId,           // id of new field
      OldId = params.OldId,           // id of old field
      Placebo = params.Placebo,       // if true do not mark threatening figures
      PlacesTest = params.PlacesTest; // other places than current places of figures, used to test for checkmate after hypothetically previously made move
  if ('undefined' === typeof PlacesTest) {
    PlacesTest = Placebo ? Places[MoveId].substring(0, NewId) + Places[MoveId][OldId] + Places[MoveId].substring(NewId + 1) : Places[MoveId];
    Placebo && (PlacesTest = PlacesTest.substring(0, OldId) + ' ' + PlacesTest.substring(OldId + 1));
  }
  let a, b,
      MarkedCheck = [], // mark threatening figures
      Color = Placebo ? 0 <= 'BKNPQR'.indexOf(Figure) ? 'White' : 'Black' : 0 <= 'BKNPQR'.indexOf(Figure) ? 'Black' : 'White', // color of player to not test check status
      KingId = PlacesTest.indexOf('Black' === Color ? 'k' : 'K'); // position of king of player to test check status
  if (0 > KingId) {
    return true;
  }
  for (a = KingId + 8, b = ' '; ' ' === b && 64 > a;              a += 8) {     // down
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  for (a = KingId + 7, b = ' '; ' ' === b && 64 > a && 7 > a % 8; a += 7) {     // down left
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  for (a = KingId + 9, b = ' '; ' ' === b && 64 > a && 0 < a % 8; a += 9) {     // down right
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  for (a = KingId - 1, b = ' '; ' ' === b &&           7 > a % 8;    --a) {     // left
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  for (a = KingId + 1, b = ' '; ' ' === b &&           0 < a % 8;    ++a) {     // right
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  for (a = KingId - 8, b = ' '; ' ' === b && 0 <= a;              a -= 8) {     // up
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  for (a = KingId - 9, b = ' '; ' ' === b && 0 <= a && 7 > a % 8; a -= 9) {     // up left
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  for (a = KingId - 7, b = ' '; ' ' === b && 0 <= a && 0 < a % 8; a -= 7) {     // up right
    if (' ' !== (b = PlacesTest[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(a);
      }
    }
  }
  if ('Black' === Color) {                                                      // Black pawn
    if (8 < KingId && 0 < KingId % 8 && 'P' === PlacesTest[KingId - 9]) {       // Black pawn up left
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(KingId - 9);
      }
    }
    if (7 < KingId && 7 > KingId % 8 && 'P' === PlacesTest[KingId - 7]) {       // Black pawn up right
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(KingId - 7);
      }
    }
  } else {                                                                      // White pawn
    if (56 > KingId && 0 < KingId % 8 && 'p' === PlacesTest[KingId + 7]) {      // White pawn down left
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(KingId + 7);
      }
    }
    if (55 > KingId && 7 > KingId % 8 && 'p' === PlacesTest[KingId + 9]) {      // White pawn down right
      if (Placebo) {
        return true;
      } else {
        MarkedCheck.push(KingId + 9);
      }
    }
  }
  if (48 > KingId && 0 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId + 15]) {// knight down left
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId + 15);
    }
  }
  if (47 > KingId && 7 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId + 17]) {// knight down right
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId + 17);
    }
  }
  if (56 > KingId && 1 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId +  6]) {// knight left down
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId +  6);
    }
  }
  if ( 9 < KingId && 1 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId - 10]) {// knight left up
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId - 10);
    }
  }
  if ( 7 < KingId && 6 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId -  6]) {// knight right up
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId -  6);
    }
  }
  if (54 > KingId && 6 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId + 10]) {// knight right up
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId + 10);
    }
  }
  if ( 6 < KingId && 0 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId - 17]) {// knight up left
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId - 17);
    }
  }
  if (15 < KingId && 7 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === PlacesTest[KingId - 15]) {// knight up right
    if (Placebo) {
      return true;
    } else {
      MarkedCheck.push(KingId - 15);
    }
  }
  if (0 < MarkedCheck.length) { // check
    // Mark all threatening figures.
    for (a = MarkedCheck.length - 1; 0 <= a; --a) {
      ClassList(document.getElementById('field' + MarkedCheck[a]), 'add', 'Check');
    }
    // Test for checkmate.
    CheckMate = 1;
    if ('undefined' !== typeof ColorTest) {
      for (let elem = document.getElementById('board').querySelectorAll('[id^="field"]'), i = elem.length - 1; 0 <= i; --i) {
        let Class = elem[i].className;
        if (0 <= Class.indexOf('Black' === ColorTest ? 'White' : 'Black')) {
          Marker(Class, parseInt(elem[i].getAttribute('data-id')), 'Black' === ColorTest ? 'q' : 'Q');
          if (!CheckMate) {
            break;
          }
        }
      }
    }
    if (CheckMate) { // Display checkmate status and hide navigation buttons and turn status.
      Attribute(document.getElementById('asideCheck'), 'innerHTML', '<span>Checkmate!</span><br><span class="' + ColorTest + 'P">' + ColorTest + '</span><span> player won.</span>');
      ClassList(document.getElementById('asideNavLeft'), 'add', 'hidden');
      ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
      ClassList(document.getElementById('asideStatus'), 'add', 'none');
    } else { // Display check status.
      Attribute(document.getElementById('asideCheck'), 'innerHTML', '<span class="' + ('Black' !== Color ? 'BlackP">Black' : 'WhiteP">White') + '</span><span> player is in check.</span>');
    }
    ClassList(document.getElementById('asideCheck'), 'remove', 'none');
  } else if (!Placebo) {
    // Test for remi.
    CheckMate = 1;
    if ('undefined' !== typeof ColorTest) {
      for (let elem = document.getElementById('board').querySelectorAll('[id^="field"]'), i = elem.length - 1; 0 <= i; --i) {
        let Class = elem[i].className;
        if (0 <= Class.indexOf('Black' === ColorTest ? 'White' : 'Black')) {
          Marker(Class, parseInt(elem[i].getAttribute('data-id')), 'Black' === ColorTest ? 'x' : 'X');
          if (!CheckMate) {
            break;
          }
        }
      }
      if (CheckMate) { // Display remi status and hide navigation buttons, turn status and check status.
        Attribute(document.getElementById('asideCheck'), 'innerHTML', '<span>Remi!</span><br><span class="' + (ColorTest === 'Black' ? 'White' : 'Black') + 'P">' + (ColorTest === 'Black' ? 'White' : 'Black') + '</span><span> player can not move.</span>');
        ClassList(document.getElementById('asideCheck'), 'remove', 'none');
        ClassList(document.getElementById('asideNavLeft'), 'add', 'hidden');
        ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
        ClassList(document.getElementById('asideStatus'), 'add', 'none');
        return;
      }
    }
  } else if (Placebo) {
    if (56 > KingId &&                   ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId + 8]) {// king down
      return true;
    }
    if (56 > KingId && 0 < KingId % 8 && ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId + 7]) {// king down left
      return true;
    }
    if (55 > KingId && 7 > KingId % 8 && ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId + 9]) {// king down right
      return true;
    }
    if (               0 < KingId % 8 && ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId - 1]) {// king left
      return true;
    }
    if (               7 > KingId % 8 && ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId + 1]) {// king right
      return true;
    }
    if ( 7 < KingId &&                   ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId - 8]) {// king up
      return true;
    }
    if ( 8 < KingId && 0 < KingId % 8 && ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId - 9]) {// king up left
      return true;
    }
    if ( 7 < KingId && 7 > KingId % 8 && ('Black' === Color ? 'K' : 'k') === PlacesTest[KingId - 7]) {// king up right
      return true;
    }
    return false;
  }
  ClassList(document.getElementById('asideCheck'), 0 < MarkedCheck.length ? 'remove' : 'add', 'none');
}
// Player has choosen a new figure to replace his pawn.
function ChooseNewFigure(Figure, NewId, OldId, This) {
  let newFigure = This.getElementsByTagName('p')[0].innerHTML;
  newFigure = 'Queen' === newFigure ? 'Q' : 'Bishop' === newFigure ? 'B' : 'Knight' === newFigure ? 'N' : 'R';
  'P' === Figure ? activePlayer = 'White' : (activePlayer = 'Black', newFigure = newFigure.toLowerCase());
  let special = '-RP-' + newFigure;
  History[MoveId - 1] += special;
  Places[MoveId] = Places[MoveId].substring(0, NewId) + newFigure + Places[MoveId].substring(NewId + 1);
  This.getElementsByTagName('input')[0].checked = false;
  document.getElementById('asideChoose').classList.add('none');
  PlaceFigures();
  Check({ColorTest: color, Figure: newFigure, Placebo: false});
  if ('undefined' === typeof WS
  || 1 !== WS.readyState) {
    return;
  }
  WS.send(JSON.stringify({
    command: 'move',
    Figure: Figure,
    NewId: NewId,
    OldId: OldId,
    positions: Places[MoveId],
    special: special
  }));
}
// Pawn reached end of board and chooses a new figure.
function ReplacePawn(Figure, NewId, OldId) {
  if (!document.getElementById('asideChoose')) {
    return;
  }
  document.getElementById('asideChoose').innerHTML =
    '<span>Choose new Figure</span><br>'+
    '<label><input name=replacePawn type=radio><p>Queen</p></label><br>'+
    '<label><input name=replacePawn type=radio><p>Bishop</p></label><br>'+
    '<label><input name=replacePawn type=radio><p>Knight</p></label><br>'+
    '<label><input name=replacePawn type=radio><p>Rook</p></label><br>';
  document.getElementById('field' + NewId).classList.add('BoardSelected' + (document.getElementById('field' + NewId).classList.contains('dark') ? 'Dark' : 'Bright'));
  // Deselect previously selected figure options.
  for (let i = document.getElementById('asideChoose').getElementsByTagName('input').length - 1; 0 <= i; --i) {
    document.getElementById('asideChoose').getElementsByTagName('input')[i].checked = false;
  }
  // Add event listener to choose new figure.
  document.getElementById('asideChoose').classList.remove('none');
  for (let i = document.getElementById('asideChoose').getElementsByTagName('label').length - 1; 0 <= i; i--) {
    document.getElementById('asideChoose').getElementsByTagName('label')[i].addEventListener('mouseup', function(event){if(0 !== event.button){return;}ChooseNewFigure(Figure, NewId, OldId, this)});
  }
}
// Mark possible fields to go to if placebo is false. Test for checkmate or remi if placebo is true.
function MarkField(NewId, OldId, placebo) {
  let Figure = Places[MoveId][OldId],
      place = Places[MoveId][NewId];
  if (!placebo && Check({Figure: Figure, Placebo: true, NewId: NewId, OldId: OldId})) {
    return place;
  }
  if (' ' === place
  || (0 <= 'BKNPQR'.indexOf(Figure) && 0 <= 'bknpqr'.indexOf(place))
  || (0 <= 'bknpqr'.indexOf(Figure) && 0 <= 'BKNPQR'.indexOf(place))) {
    if (!placebo) {
      document.getElementById('field' + NewId).classList.add('BoardPossible' + (document.getElementById('field' + NewId).classList.contains('dark') ? 'Dark' : 'Bright'));
      Marked.push(NewId);
      document.getElementById('field' + NewId).addEventListener('mouseup', Move);
    } else if ('x' === placebo || 'X' === placebo) {                            // remi
      if (!Check({Figure: 'x' === placebo ? 'q' : 'Q', Placebo: true, NewId: NewId, OldId: OldId})) {
        CheckMate = 0;
      }
    } else {                                                                    // checkmate
      if (!Check({Figure: placebo, Placebo: true, NewId: NewId, OldId: OldId})) {
        let PlacesTest = Places[MoveId].substring(0, NewId) + Figure + Places[MoveId].substring(NewId + 1);
        PlacesTest = PlacesTest.substring(0, OldId) + ' ' + PlacesTest.substring(OldId + 1);
        if (!Check({Figure: placebo, Placebo: true, NewId: NewId, OldId: OldId, PlacesTest: PlacesTest})) {
          CheckMate = 0;
        }
      }
    }
  }
  return place;
}
// Player has choosen not to castle.
function CastleNo(Figure, NewId, OldId) {
  ClassList(document.getElementById('asideChoose'), 'add', 'none');
  activePlayer = 0 <= 'BKNPQR'.indexOf(Figure) ? 'White' : 'Black';
  PlaceFigures();
  Check({ColorTest: activePlayer, Figure: Figure, Placebo: false});
  if ('undefined' === typeof WS
  || 1 !== WS.readyState) {
    return;
  }
  WS.send(JSON.stringify({
    command: 'move',
    Figure: Figure,
    NewId: NewId,
    OldId: OldId,
    positions: Places[MoveId]
  }));
}
// Player has choosen to castle.
function CastleYes(Figure, NewId, OldId) {
  ClassList(document.getElementById('asideChoose'), 'add', 'none');
  let special;
  if (3 === NewId) {                                                            // Castle: Black left
    if ('K' === Places[MoveId][4]) {
      Places[MoveId] = '  KR ' + Places[MoveId].substring(5);
      special = '-K4-2';
      History[MoveId - 1] += special;
      activePlayer = 0 <= 'BKNPQR'.indexOf(Figure) ? 'White' : 'Black';
      PlaceFigures();
      Check({ColorTest: 'Black' === activePlayer ? 'White' : 'Black', Figure: 'R', Placebo: false});
      Check({ColorTest: color, Figure: 'R', Placebo: false});
    }
  }  else if (5 === NewId) {                                                    // Castle: Black right
    if ('K' === Places[MoveId][4]) {
      Places[MoveId] = Places[MoveId].substring(0, 4) + ' RK' + Places[MoveId].substring(7);
      special = '-K4-6';
      History[MoveId - 1] += special;
      activePlayer = 0 <= 'BKNPQR'.indexOf(Figure) ? 'White' : 'Black';
      PlaceFigures();
      Check({ColorTest: 'Black' === activePlayer ? 'White' : 'Black', Figure: 'R', Placebo: false});
    }
  } else if (59 === NewId) {                                                    // Castle: White left
    if ('k' === Places[MoveId][60]) {
      Places[MoveId] = Places[MoveId].substring(0, 56) + '  kr ' + Places[MoveId].substring(61);
      special = '-k60-58';
      History[MoveId - 1] += special;
      activePlayer = 0 <= 'BKNPQR'.indexOf(Figure) ? 'White' : 'Black';
      PlaceFigures();
      Check({ColorTest: 'Black' === activePlayer ? 'White' : 'Black', Figure: 'r', Placebo: false});
    }
  } else {                                                                      // Castle: White right
    if ('k' === Places[MoveId][60]) {
      Places[MoveId] = Places[MoveId].substring(0, 60) + ' rk ';
      special = '-k60-62';
      History[MoveId - 1] += special;
      activePlayer = 0 <= 'BKNPQR'.indexOf(Figure) ? 'White' : 'Black';
      PlaceFigures();
      Check({ColorTest: activePlayer, Figure: 'r', Placebo: false});
    }
  }
  if ('undefined' === typeof WS
  || 1 !== WS.readyState) {
    return;
  }
  let send = {
    command: 'move',
    Figure: Figure,
    NewId: NewId,
    OldId: OldId,
    positions: Places[MoveId]
  };
  special && (send.special = special);
  WS.send(JSON.stringify(send));
}
// Figure is moved. Update History and Places.
function Move(message) {
  if ('undefined' !== typeof message.button                                     // only accept main mouse button
  && 0 !== message.button) {
    return;
  }
  if ('undefined' === typeof message.Figure
  || 'undefined' === typeof message.NewId
  || 'undefined' === typeof message.OldId
  || 'undefined' === typeof message.Places) {                                   // player moved figure
    var NewId = parseInt(this.getAttribute('data-id')),
        OldId = Marked[0],
        Figure = Places[MoveId][OldId],
        partner = 0;
    Places[MoveId + 1] = Places[MoveId].substring(0, NewId) + Figure + Places[MoveId].substring(NewId + 1);
    Places[MoveId + 1] = Places[MoveId + 1].substring(0, OldId) + ' ' + Places[MoveId + 1].substring(OldId + 1);
  } else {                                                                      // other player moved figure
    var Figure = message.Figure,
        NewId = message.NewId,
        OldId = message.OldId,
        partner = 1;
    Places[MoveId + 1] = message.Places;
  }
  let special;
  History[MoveId] = Figure + OldId + '-' + NewId;
  if (!document.getElementById('asideNavRight').classList.contains('hidden')) {
    ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
    History.length = MoveId + 1; // delete obsolete history if move back was previously used
    Places.length = MoveId + 2; // delete obsolete places if move back was previously used
  }
  ++MoveId;
  if ('online' === mode) {
    ClassList(document.getElementById('asideNavLeft'), activePlayer === color ? 'remove' : 'add', 'hidden');
  } else {
    ClassList(document.getElementById('asideNavLeft'), 'remove', 'hidden');
  }
  if (55 < NewId && 'P' === Figure || 8 > NewId && 'p' === Figure) {
    activePlayer = '';
  } else {
    activePlayer = 'Black' === activePlayer ? 'White' : 'Black';
  }
  if ('P' === Figure && 39 < NewId && 48 > NewId && OldId - 8 !== NewId) {      // Black pawn en passant
    if (NewId - 8 !== OldId) {
      if ('undefined' !== typeof History[MoveId - 1]
      && 'p' + NewId + '-' + (NewId + 16) === History[MoveId - 1]) {
        special = '-EP';
        History[MoveId - 1] += special;
      }
      Places[MoveId] = Places[MoveId].substring(0, NewId - 8) + ' ' + Places[MoveId].substring(NewId - 7);
    }
  } else if ('p' === Figure && 15 < NewId && 24 > NewId && OldId + 8 !== NewId) {// White pawn en passant
    if (NewId + 8 !== OldId) {
      if ('undefined' !== typeof History[MoveId - 1]
      && 'P' + NewId + '-' + (NewId - 16) === History[MoveId - 1]) {
        special = '-EP';
        History[MoveId - 1] += special;
      }
      Places[MoveId] = Places[MoveId].substring(0, NewId + 8) + ' ' + Places[MoveId].substring(NewId + 9);
    }
  } else if ('K' === Figure) {                                                  // Castle: Black king
    CastleBlackLeft = CastleBlackRight = 0;
  } else if ('k' === Figure) {                                                  // Castle: White king
    CastleWhiteLeft = CastleWhiteRight = 0;
  } else if ('R' === Figure) {                                                  // Castle: Black rook
    if (0 === OldId) {                                                          // Castle: Black rook left
      if (3 === NewId
      && CastleBlackLeft
      && ' ' === Places[MoveId - 1][1]
      && ' ' === Places[MoveId - 1][2]
      && ' ' === Places[MoveId - 1][3]
      && !Check({Figure: 'K', Placebo: true, NewId: 3, OldId: 4})
      && !Check({Figure: 'K', Placebo: true, NewId: 2, OldId: 4})) {
        activePlayer = 'Castle';
        if (!partner) {
          document.getElementById('asideChoose').innerHTML =
            '<span>Do you want to castle?</span><br>'+
            '<label><input name=Castle type=radio><p>Yes</p></label><br>'+
            '<label><input name=Castle type=radio><p>No</p></label>';
          document.getElementById('asideChoose').getElementsByTagName('input')[0].addEventListener('click', function() {CastleYes(Figure, NewId, OldId);});
          document.getElementById('asideChoose').getElementsByTagName('input')[1].addEventListener('click', function() {CastleNo(Figure, NewId, OldId);});
          ClassList(document.getElementById('asideChoose'), 'remove', 'none');
        }
      }
      CastleBlackLeft = 0;
    } else if (7 === OldId) {                                                   // Castle: Black rook right
      if (5 === NewId
      && CastleBlackRight
      && ' ' === Places[MoveId - 1][5]
      && ' ' === Places[MoveId - 1][6]
      && !Check({Figure: 'K', Placebo: true, NewId: 5, OldId: 4})
      && !Check({Figure: 'K', Placebo: true, NewId: 6, OldId: 4})) {
        activePlayer = 'Castle';
        if (!partner) {
          document.getElementById('asideChoose').innerHTML =
            '<span>Use Castle</span><br>'+
            '<label><input name=Castle type=radio><p>Yes</p></label><br>'+
            '<label><input name=Castle type=radio><p>No</p></label>';
          document.getElementById('asideChoose').getElementsByTagName('input')[0].addEventListener('click', function() {CastleYes(Figure, NewId, OldId);});
          document.getElementById('asideChoose').getElementsByTagName('input')[1].addEventListener('click', function() {CastleNo(Figure, NewId, OldId);});
          ClassList(document.getElementById('asideChoose'), 'remove', 'none');
        }
      }
      CastleBlackRight = 0;
    }
  } else if ('r' === Figure) {                                                  // Castle: White rook
    if (56 === OldId) {                                                         // Castle: White rook left
      if (59 === NewId
      && CastleWhiteLeft
      && ' ' === Places[MoveId - 1][57]
      && ' ' === Places[MoveId - 1][58]
      && ' ' === Places[MoveId - 1][59]
      && !Check({Figure: 'k', Placebo: true, NewId: 59, OldId: 60})
      && !Check({Figure: 'k', Placebo: true, NewId: 58, OldId: 60})) {
        activePlayer = 'Castle';
        if (!partner) {
          document.getElementById('asideChoose').innerHTML =
            '<span>Use Castle</span><br>'+
            '<label><input name=Castle type=radio><p>Yes</p></label><br>'+
            '<label><input name=Castle type=radio><p>No</p></label>';
          document.getElementById('asideChoose').getElementsByTagName('input')[0].addEventListener('click', function() {CastleYes(Figure, NewId, OldId);});
          document.getElementById('asideChoose').getElementsByTagName('input')[1].addEventListener('click', function() {CastleNo(Figure, NewId, OldId);});
          ClassList(document.getElementById('asideChoose'), 'remove', 'none');
        }
      }
      CastleWhiteLeft = 0;
    } else if (63 === OldId) {                                                  // Castle: White rook right
      if (61 === NewId
      && CastleWhiteRight
      && ' ' === Places[MoveId - 1][61]
      && ' ' === Places[MoveId - 1][62]
      && !Check({Figure: 'k', Placebo: true, NewId: 61, OldId: 60})
      && !Check({Figure: 'k', Placebo: true, NewId: 62, OldId: 60})) {
        activePlayer = 'Castle';
        if (!partner) {
          document.getElementById('asideChoose').innerHTML =
            '<span>Use Castle</span><br>'+
            '<label><input name=Castle type=radio><p>Yes</p></label><br>'+
            '<label><input name=Castle type=radio><p>No</p></label>';
          document.getElementById('asideChoose').getElementsByTagName('input')[0].addEventListener('click', function() {CastleYes(Figure, NewId, OldId);});
          document.getElementById('asideChoose').getElementsByTagName('input')[1].addEventListener('click', function() {CastleNo(Figure, NewId, OldId);});
          ClassList(document.getElementById('asideChoose'), 'remove', 'none');
        }
      }
      CastleWhiteRight = 0;
    }
  }
  // Pawn reached end of board. Do not send move to server until player has choosen new figure.
  if ('' === activePlayer) {
    if (partner) {
      activePlayer = 'P' === Figure ? 'White' : 'Black';
      PlaceFigures();
    } else {
      PlaceFigures();
      Marked = [];
      ReplacePawn(Figure, NewId, OldId);
    }
    Check({ColorTest: 'Black' === activePlayer ? 'White' : 'Black', Figure: Figure, Placebo: false});
    return;
  }
  // Castle. Do not send move to server until player has choosen castle status.
  if ('Castle' === activePlayer) {
    if (partner) {
      activePlayer = 'P' === Figure ? 'White' : 'Black';
      PlaceFigures();
    } else {
      PlaceFigures();
      Marked = [];
    }
    Check({ColorTest: 'Black' === activePlayer ? 'White' : 'Black', Figure: Figure, Placebo: false});
    return;
  }
  PlaceFigures();
  Marked = [];
  // Mark threatening figures.
  Check({ColorTest: partner ? 'Black' === color ? 'White' : 'Black' : color, Figure: Figure, Placebo: false});
  if (partner
  || 'undefined' === typeof WS
  || 1 !== WS.readyState) {
    return;
  }
  let send = {
    command: 'move',
    Figure: Figure,
    NewId: NewId,
    OldId: OldId,
    positions: Places[MoveId]
  };
  special && (send.special = special);
  WS.send(JSON.stringify(send));
}
// Calculate possible fields to go to if placebo is false. Calculate checkmate status if placebo is true.
function Marker(Class, Id, placebo) {
  let a, b;
  if (0 < Class.indexOf('Bishop')) {                                            // bishop
    for (a = Id + 7, b = ' '; ' ' === b && 64 >  a && 7 > a % 8; a += 7) {      // bishop down left
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id + 9, b = ' '; ' ' === b && 64 >  a && 0 < a % 8; a += 9) {      // bishop down right
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 9, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8; a -= 9) {      // bishop up left
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 7, b = ' '; ' ' === b &&  0 <= a && 0 < a % 8; a -= 7) {      // bishop up right
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
  } else if (0 < Class.indexOf('King')) {                                       // king
     56 > Id &&               MarkField(Id +  8, Id, placebo); if (placebo && !CheckMate) {return;}// king down
     56 > Id && 0 < Id % 8 && MarkField(Id +  7, Id, placebo); if (placebo && !CheckMate) {return;}// king down left
     55 > Id && 7 > Id % 8 && MarkField(Id +  9, Id, placebo); if (placebo && !CheckMate) {return;}// king down right
                0 < Id % 8 && MarkField(Id -  1, Id, placebo); if (placebo && !CheckMate) {return;}// king left
                7 > Id % 8 && MarkField(Id +  1, Id, placebo); if (placebo && !CheckMate) {return;}// king right
      7 < Id &&               MarkField(Id -  8, Id, placebo); if (placebo && !CheckMate) {return;}// king up
      8 < Id && 0 < Id % 8 && MarkField(Id -  9, Id, placebo); if (placebo && !CheckMate) {return;}// king up left
      7 < Id && 7 > Id % 8 && MarkField(Id -  7, Id, placebo); if (placebo && !CheckMate) {return;}// king up right
  } else if (0 < Class.indexOf('Knight')) {                                     // knight
     48 > Id && 0 < Id % 8 && MarkField(Id + 15, Id, placebo); if (placebo && !CheckMate) {return;}// knight down left
     47 > Id && 7 > Id % 8 && MarkField(Id + 17, Id, placebo); if (placebo && !CheckMate) {return;}// knight down right
     56 > Id && 1 < Id % 8 && MarkField(Id +  6, Id, placebo); if (placebo && !CheckMate) {return;}// knight left down
      9 < Id && 1 < Id % 8 && MarkField(Id - 10, Id, placebo); if (placebo && !CheckMate) {return;}// knight left up
     54 > Id && 6 > Id % 8 && MarkField(Id + 10, Id, placebo); if (placebo && !CheckMate) {return;}// knight right down
      7 < Id && 6 > Id % 8 && MarkField(Id -  6, Id, placebo); if (placebo && !CheckMate) {return;}// knight right up
     16 < Id && 0 < Id % 8 && MarkField(Id - 17, Id, placebo); if (placebo && !CheckMate) {return;}// knight up left
     15 < Id && 7 > Id % 8 && MarkField(Id - 15, Id, placebo); if (placebo && !CheckMate) {return;}// knight up right
  } else if (0 < Class.indexOf('Pawn')) {                                       // pawn
    if (0 > Class.indexOf('White')) {                                           // Black pawn
      if (0 < Id % 8 && 0 <= 'bknpqr'.indexOf(Places[MoveId][Id + 7])) {        // Black pawn down left
        MarkField(Id  + 7, Id, placebo); if (placebo && !CheckMate) {return;}
      }
      if (55 > Id && 7 > Id % 8 && 0 <= 'bknpqr'.indexOf(Places[MoveId][Id + 9])) {// Black pawn down right
        MarkField(Id + 9, Id, placebo); if (placebo && !CheckMate) {return;}
      }
      if (' ' === Places[MoveId][Id + 8]) {
        MarkField(Id + 8, Id, placebo); if (placebo && !CheckMate) {return;}    // Black pawn down
        16 > Id && ' ' === Places[MoveId][Id + 16] && MarkField(Id + 16, Id, placebo); if (placebo && !CheckMate) {return;}// Black pawn two fields down
      }
      if (31 < Id && 40 > Id && (a = History[MoveId - 1])) {                    // Black pawn en passant
        if ('p' + (Id + 15) + '-' + (Id - 1) === a) {                           // Black pawn en passant left
          MarkField(Id + 7, Id, placebo); if (placebo && !CheckMate) {return;}
        } else if ('p' + (Id + 17) + '-' + (Id + 1) === a) {                    // Black pawn en passant right
          MarkField(Id + 9, Id, placebo); if (placebo && !CheckMate) {return;}
        }
      }
    } else {                                                                    // White pawn
      if (8 < Id && 0 < Id % 8 && 0 <= 'BKNPQR'.indexOf(Places[MoveId][Id - 9])) {// White pawn up left
        MarkField(Id - 9, Id, placebo); if (placebo && !CheckMate) {return;}
      }
      if (7 > Id % 8 && 0 <= 'BKNPQR'.indexOf(Places[MoveId][Id - 7])) {        // White pawn up right
        MarkField(Id - 7, Id, placebo); if (placebo && !CheckMate) {return;}
      }
      if (' ' === Places[MoveId][Id - 8]) {
        MarkField(Id - 8, Id, placebo); if (placebo && !CheckMate) {return;}    // White pawn up
        47 < Id && ' ' === Places[MoveId][Id - 16] && MarkField(Id - 16, Id, placebo); if (placebo && !CheckMate) {return;}// White pawn two fields up
      }
      if (23 < Id && 32 > Id && (a = History[MoveId - 1])) {                    // White pawn en passant
        if ('P' + (Id - 17) + '-' + (Id - 1) === a) {                           // White pawn en passant left
          MarkField(Id - 9, Id, placebo); if (placebo && !CheckMate) {return;}
        } else if ('P' + (Id - 15) + '-' + (Id + 1) === a) {                    // White pawn en passant right
          MarkField(Id - 7, Id, placebo); if (placebo && !CheckMate) {return;}
        }
      }
    }
  } else if (0 < Class.indexOf('Queen')) {                                      // queen
    for (a = Id + 8, b = ' '; ' ' === b && 64 >  a;              a += 8) {      // queen down
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id + 7, b = ' '; ' ' === b && 64 >  a && 7 > a % 8; a += 7) {      // queen down left
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id + 9, b = ' '; ' ' === b && 64 >  a && 0 < a % 8; a += 9) {      // queen down right
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 1, b = ' '; ' ' === b &&            7 > a % 8;    --a) {      // queen left
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id + 1, b = ' '; ' ' === b &&            0 < a % 8;    ++a) {      // queen right
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 8, b = ' '; ' ' === b &&  0 <= a;              a -= 8) {      // queen up
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 9, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8; a -= 9) {      // queen up left
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 7, b = ' '; ' ' === b &&  0 <= a && 0 < a % 8; a -= 7) {      // queen up right
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
  } else if (0 < Class.indexOf('Rook')) {                                       // rook
    for (a = Id + 8, b = ' '; ' ' === b && 64 >  a;              a += 8) {      // rook down
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 1, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8;    --a) {      // rook left
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id + 1, b = ' '; ' ' === b &&            0 < a % 8;    ++a) {      // rook right
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
    for (a = Id - 8, b = ' '; ' ' === b &&  0 <= a;              a -= 8) {      // rook up
      b = MarkField(a, Id, placebo); if (placebo && !CheckMate) {return;}
    }
  }
}
// Player clicked on one of his figures while being the active player.
function MouseUpFigure(event) {
  if (0 !== event.button) {                                                     // only accept main mouse button
    return;
  }
  let selected = this.classList.contains('BoardSelectedBright') || this.classList.contains('BoardSelectedDark');
  for (let i = Marked.length - 1; 0 <= i; --i) {                                // unmark all marked fields
    let elem = document.getElementById('field' + Marked[i]);
    elem.classList.remove('BoardPossibleBright');
    elem.classList.remove('BoardPossibleDark');
    elem.classList.remove('BoardSelectedBright');
    elem.classList.remove('BoardSelectedDark');
    elem.removeEventListener('mouseup', Move);
  }
  // Player deselected a figure. End function to not falsely mark possible fields to go to.
  if (selected) {
    return;
  }
  this.classList.add('BoardSelected' + (this.classList.contains('dark') ? 'Dark' : 'Bright'));// mark selected field
  let Id = parseInt(this.getAttribute('data-id'));
  Marked = [Id];
  Marker(this.className, Id, '');
}
// Display color active player.
function AsideStatus(player) {
  document.getElementById('asideStatus').innerHTML = "<span>It's </span><span class=" + ('Black' === player ? "BlackP>Black" : "WhiteP>White") + "</span><span> player's turn.</span>";
}
// Place all figures according to current MoveId from Places array.
function PlaceFigures() {
  ClassList(document.getElementById('asideCheck'), 'add', 'none');
  for (let i = 0, elem = document.getElementById('board').querySelectorAll('[id^="field"]'), k; i < elem.length; ++i) {
    elem[i].removeEventListener('mouseup', Move);                               // remove event listeners
    elem[i].className = elem[i].classList.contains('dark') ? 'dark' : 'bright'; // remove all classes and add dark or bright
    k = Places[MoveId][i];
    if ('undefined' !== typeof activePlayer) {                                  // reassign event listeners if there is an active player
      if ('' !== activePlayer) {                                                // display color of active player if there is one
        AsideStatus(activePlayer);
      }
      if (0 <= 'BKNPQR'.indexOf(k)) {
        if ('Black' === activePlayer
        && (activePlayer === color || 'offline' === mode)) {                    // reassign event listeners for black active player
          elem[i].classList.add('Active');
          elem[i].addEventListener('mouseup', MouseUpFigure);
        } else {
          elem[i].classList.remove('Active');
          elem[i].removeEventListener('mouseup', MouseUpFigure);
        }
      } else if (' ' !== k) {
        if ('White' === activePlayer
        && (activePlayer === color || 'offline' === mode)) {                    // reassign event listeners for white active player
          elem[i].classList.add('Active');
          elem[i].addEventListener('mouseup', MouseUpFigure);
        } else {
          elem[i].classList.remove('Active');
          elem[i].removeEventListener('mouseup', MouseUpFigure);
        }
      } else {
        elem[i].classList.remove('Active');
        elem[i].removeEventListener('mouseup', MouseUpFigure);
      }
    }
    // Add classes to fields with figures.
    if ('B' === k) {
      elem[i].classList.add('BlackBishop');
    } else if ('b' === k) {
      elem[i].classList.add('WhiteBishop');
    } else if ('K' === k) {
      elem[i].classList.add('BlackKing');
    } else if ('k' === k) {
      elem[i].classList.add('WhiteKing');
    } else if ('N' === k) {
      elem[i].classList.add('BlackKnight');
    } else if ('n' === k) {
      elem[i].classList.add('WhiteKnight');
    } else if ('P' === k) {
      elem[i].classList.add('BlackPawn');
    } else if ('p' === k) {
      elem[i].classList.add('WhitePawn');
    } else if ('Q' === k) {
      elem[i].classList.add('BlackQueen');
    } else if ('q' === k) {
      elem[i].classList.add('WhiteQueen');
    } else if ('R' === k) {
      elem[i].classList.add('BlackRook');
    } else if ('r' === k) {
      elem[i].classList.add('WhiteRook');
    }
  }
}
// Reverse move.
function MoveBack(event) {
  if ('undefined' !== typeof event && 0 !== event.button) {                     // only accept main mouse button
    return;
  }
  // Only reverse move until first move.
  if (1 > MoveId) {
    return;
  }
  // Use castle variables according to MoveId.
  let a, Figure = History[MoveId - 1][0];
  if (0 < (a = History[MoveId - 1]).indexOf('-', 2)) {
    if (0 === (a = parseInt(a.substring(1)))) {
      CastleBlackLeft = 1;
    } else if (7 === a) {
      CastleBlackRight = 1;
    } else if (56 === a) {
      CastleWhiteLeft = 1;
    } else {
      CastleWhiteRight = 1;
    }
  }
  --MoveId;
  // Display or hide navigation buttons.
  if ('online' === mode) {
    if (activePlayer !== color) {
      ClassList(document.getElementById('asideNavLeft'), 'add', 'hidden');
      ClassList(document.getElementById('asideNavRight'), 'remove', 'hidden');
    } else {
      ClassList(document.getElementById('asideNavLeft'), MoveId ? 'remove' : 'add', 'hidden');
      ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
    }
  } else {
    !MoveId && ClassList(document.getElementById('asideNavLeft'), 'add', 'hidden');
    ClassList(document.getElementById('asideNavRight'), 'remove', 'hidden');
  }
  // Change active player.
  if (document.getElementById('asideChoose').classList.contains('none')) {
    activePlayer = 'Black' === activePlayer ? 'White' : 'Black';
  } else {
    ClassList(document.getElementById('asideChoose'), 'add', 'none');
    activePlayer = 0 <= 'BKNPQR'.indexOf(Figure) ? 'Black' : 'White';
  }
  PlaceFigures();
  Check({ColorTest: 'undefined' !== typeof event ? 'Black' === color ? 'White' : 'Black' : color, Figure: (0 <= 'BKNPQR'.indexOf(Figure) ? Figure.toLowerCase() : Figure.toUpperCase()), Placebo: false});
  'undefined' !== typeof event && 'undefined' !== typeof WS && 1 === WS.readyState && WS.send(JSON.stringify({command: 'moveBack'}));
}
document.getElementById('asideNavLeft').addEventListener('click', MoveBack);
// Forward move.
function MoveForward(event) {
  if ('undefined' !== typeof event && 0 !== event.button) {                     // only accept main mouse button
    return;
  }
  // Forward move only until last move already made.
  if ('undefined' === typeof Places[MoveId + 1]) {
    return;
  }
  // Use castle variables according to MoveId.
  let a, Figure = History[MoveId][0];
  if (0 < (a = History[MoveId]).indexOf('-', 2)) {
    if (0 === (a = parseInt(a.substring(1)))) {
      CastleBlackLeft = 0;
    } else if (7 === a) {
      CastleBlackRight = 0;
    } else if (56 === a) {
      CastleWhiteLeft = 0;
    } else {
      CastleWhiteRight = 0;
    }
  }
  ++MoveId;
  // Display or hide navigation buttons.
  if ('online' === mode) {
    if (activePlayer === color) {
      ClassList(document.getElementById('asideNavLeft'), 'remove', 'hidden');
      ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
    } else {
      ClassList(document.getElementById('asideNavLeft'), 'add', 'hidden');
      ClassList(document.getElementById('asideNavRight'), 'undefined' !== typeof Places[MoveId + 1] ? 'remove' : 'add', 'hidden');
    }
  } else {
    'undefined' === typeof Places[MoveId + 1] && ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
    ClassList(document.getElementById('asideNavLeft'), 'remove', 'hidden');
  }
  // Change active player.
  if (document.getElementById('asideChoose').classList.contains('noe')) {
    activePlayer = 'Black' === activePlayer ? 'White' : 'Black';
  } else {
    ClassList(document.getElementById('asideChoose'), 'add', 'none');
    activePlayer = 0 <= 'BKNPQR'.indexOf(Figure) ? 'White' : 'Black';
  }
  PlaceFigures();
  Check({ColorTest: 'undefined' !== typeof event ? color : 'Black' === color ? 'White' : 'Black', Figure: (0 <= 'BKNPQR'.indexOf(Figure) ? Figure.toUpperCase() : Figure.toLowerCase()), Placebo: false});
  'undefined' !== typeof event && 'undefined' !== typeof WS && 1 === WS.readyState && WS.send(JSON.stringify({command: 'moveForward'}));
}
document.getElementById('asideNavRight').addEventListener('click', MoveForward);
// Copy invitation link.
function InvitationLinkCopy() {
  let elem = document.getElementById('invitationLink'),
      This = this;
  elem.select();
  elem.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(elem.value);
  this.style.width = getComputedStyle(this).width;
  this.value = 'Link copied';
  setTimeout(function(){RestoreValue(This)}, 3E3);
}
document.getElementById('invitationLinkCopy') && document.getElementById('invitationLinkCopy').addEventListener('click', InvitationLinkCopy);
// Test if string could be converted to JSON.
function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
// Display partner network status.
function AsidePartner(partnerStatus) {
  Attribute(document.getElementById('asidePartner'), 'innerHTML', '<span class="' + ('Black' === color ? 'White' : 'Black') + 'P">' + ('Black' === color ? 'White' : 'Black') + '</span><span> player is </span><span class="' + partnerStatus + '">' + partnerStatus + '</span><span>.</span>');
  ClassList(document.getElementById('invitationLinkOuter'), 'online' === partnerStatus ? 'add' : 'remove', 'none');
  let params = new URLSearchParams(location.search);
  ClassList(document.getElementById('settingsInvitationLinkOuter'), 'online' === partnerStatus || params.get('token') ? 'remove' : 'add', 'none');
  if (document.getElementById('settingsInvitationLinkOuter')) {
    document.getElementById('settingsInvitationLink').checked = 'online' === partnerStatus ? !1 : !0;
  }
}
// Change class if element exists.
function ClassList(elem, method, value) {
  elem && elem.classList[method](value);
}
// Change attribute if element exists.
function Attribute(elem, method, value) {
  elem && (elem[method] = value);
}
// Remove all event listeners from board.
function RemoveBoardEvents() {
  for (let elem = document.getElementById('board').querySelectorAll('[id^="field"]'), i = elem.length - 1; 0 <= i; --i) {
    ClassList(elem[i], 'remove', 'BoardPossibleBright');
    ClassList(elem[i], 'remove', 'BoardPossibleDark');
    ClassList(elem[i], 'remove', 'BoardSelectedDark');
    ClassList(elem[i], 'remove', 'BoardSelectedBright');
    if (elem[i].classList.contains('Active')) {
      elem[i].classList.remove('Active');
      elem[i].removeEventListener('mouseup', MouseUpFigure);
    }
  }
}
// Start websocket connection and add event listeners.
function StartWS(token, message) {
  // Close websocket connection if any.
  if ('undefined' !== typeof WS
  && 1 === WS.readyState) {
    return;
  }
  WS = new WebSocket('wss://wss.neverwasinparis.com:5000/?token=' + token, 'echo-protocol');
  // Connection established. Send message if any, hide asideMessage and enable chat input.
  WS.onopen = function () {
    'object' === typeof message && WS.send(JSON.stringify(message));
    ClassList(document.getElementById('asideMessage'), 'add', 'none');
    Attribute(document.getElementById('asideMessage'), 'textContent', '');
    document.getElementById('asideMessageNew') && document.getElementById('asideMessageNew').removeAttribute('disabled');
  };
  // WS closed.
  WS.onclose = function(e) {
    //console.log(e);
    if ('undefined' !== typeof e.code
    && 1006 === e.code) {                                                       // Reconnect instantly.
      Attribute(document.getElementById('asideMessage'), 'innerHTML', '<span>Reconnecting...</span>');
      ClassList(document.getElementById('asideMessage'), 'remove', 'none');
      RemoveBoardEvents();
      document.getElementById('asideMessageNew') && document.getElementById('asideMessageNew').setAttribute('disabled', 'disabled');
      ClassList(document.getElementById('asideNavLeft'), 'add', 'hidden');
      ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
      if ('undefined' !== typeof message) {
        StartGame(message);
      } else {
        StartGame();
      }
    }
  };
  // WS error occured.
  WS.onerror = function (error) {
    console.log(error);
  };
  // WS message received.
  WS.onmessage = function (message) {
    if (!IsJsonString(message.data)) {
      console.log('Error: Message is not JSON.');
      return;
    }
    message = JSON.parse(message.data);
    if ('undefined' === typeof message.command) {
      console.log('Error: Message has no command key.');
      return;
    }
    // Enter existing game.
    if ('join' === message.command) {
      if ('undefined' === typeof message.activePlayer) {
        console.log('Error: Message has no activePlayer key.');
        return;
      }
      if ('undefined' === typeof message.ChatId) {
        console.log('Error: Message has no ChatId key.');
        return;
      }
      if ('undefined' === typeof message.chat) {
        console.log('Error: Message has no chat key.');
        return;
      }
      if ('undefined' === typeof message.color) {
        console.log('Error: Message has no color key.');
        return;
      }
      if ('undefined' === typeof message.History) {
        console.log('Error: Message has no History key.');
        return;
      }
      if ('undefined' === typeof message.moveId) {
        console.log('Error: Message has no MoveId key.');
        return;
      }
      if ('undefined' === typeof message.now) {
        console.log('Error: Message has no now key.');
        return;
      }
      if ('undefined' === typeof message.Places) {
        console.log('Error: Message has no Places key.');
        return;
      }
      if ('undefined' === typeof message.castleBlackLeft) {
        console.log('Error: Message has no castleBlackLeft key.');
        return;
      }
      if ('undefined' === typeof message.castleBlackRight) {
        console.log('Error: Message has no castleBlackRight key.');
        return;
      }
      if ('undefined' === typeof message.castleWhiteLeft) {
        console.log('Error: Message has no castleWhiteLeft key.');
        return;
      }
      if ('undefined' === typeof message.castleWhiteRight) {
        console.log('Error: Message has no castleWhiteRight key.');
        return;
      }
      if ('undefined' === typeof message.token) {
        console.log('Error: Message has no token key.');
        return;
      }
      if ('undefined' === typeof message.tokenInvite) {
        console.log('Error: Message has no tokenInvite key.');
        return;
      }
      activePlayer = message.activePlayer;
      ChatId = message.ChatId;
      color = message.color;
      // Clear chat messages and insert new chat messages.
      if (document.getElementById('asideMessagesOld')) {
        Attribute(document.getElementById('asideMessagesOld'), 'textContent', '');
        let now = Math.round((new Date).getTime() / 1E3);
        for (let i = 0; i < message.chat.length; ++i) {
          let date = now - (message.now - message.chat[i].created);
          ChatAdd(date, now, message.chat[i].message, 'chatTextareaOuter' + (color === message.chat[i].color ? 'Self' : 'Partner'));
        }
        if ('undefined' !== typeof ChatDateTimer) {
          clearTimeout(ChatDateTimer);
          ChatDateTimer = undefined;
        }
        ChatDate();
      }
      ClassList(document.getElementById('asidePartner'), 'remove', 'none');
      ClassList(document.getElementById('asideStatus'), 'remove', 'none');
      History = message.History;
      mode = 'online';
      MoveId = message.moveId;
      Places = message.Places;
      PlaceFigures();
      CastleBlackLeft = null === message.castleBlackLeft ? 1 : 0;
      CastleBlackRight = null === message.castleBlackRight ? 1 : 0;
      CastleWhiteLeft = null === message.castleWhiteLeft ? 1 : 0;
      CastleWhiteRight = null === message.castleWhiteRight ? 1 : 0;
      ClassList(document.getElementById('asideNavLeft'), activePlayer !== color && 'undefined' !== typeof History[MoveId - 1] ? 'remove' : 'add', 'hidden');
      ClassList(document.getElementById('asideNavRight'), activePlayer === color && 'undefined' !== typeof History[MoveId] ? 'remove' : 'add', 'hidden');
      Check({ColorTest: activePlayer !== color ? color : 'Black' === color ? 'White' : 'Black', Figure: 'Black' === activePlayer ? 'q' : 'Q', Placebo: false});
      localStorage.setItem('color', message.color);
      localStorage.setItem('token', message.token);
      document.getElementById('asideMessageNew') && document.getElementById('asideMessageNew').removeAttribute('disabled');
      ClassList(document.getElementById('asideChat'), 'remove', 'none');
      Attribute(document.getElementById('invitationLink'), 'value', location.protocol + '//' + location.host + '/?token=' + message.tokenInvite);
    // Throw player out if another player of same color enters.
    } else if ('kick' === message.command) {
      Attribute(document.getElementById('asideMessage'), 'innerHTML', '<span>You have been kicked out of the game because another player of the same color joined.</span>');
      ClassList(document.getElementById('asideMessage'), 'remove', 'none');
      window.history.pushState({}, '', '/');
      Popstate();
    // Insert chat message.
    } else if ('message' === message.command) {
      if ('undefined' === typeof message.message) {
        console.log('Error: Message has no message key.');
        return;
      }
      let now = Math.round((new Date).getTime() / 1E3);
      ChatAdd(now, now, message.message, 'chatTextareaOuterPartner');
    // Other player made a move.
    } else if ('move' === message.command) {
      Move(message);
    // Other player reversed move.
    } else if ('moveBack' === message.command) {
      MoveBack();
    // Other player moved forward.
    } else if ('moveForward' === message.command) {
      MoveForward();
    // Status of other players network status.
    } else if ('partner' === message.command) {
      if ('undefined' === typeof message.status) {
        console.log('Error: Message has no status key.');
        return;
      }
      if ('offline' !== message.status && 'online' !== message.status) {
        console.log('Error: Status key is invalid.');
        return;
      }
      AsidePartner(message.status);
    // Game started.
    } else if ('startPositions' === message.command) {
      if ('undefined' === typeof message.ChatId) {
        console.log('Error: Message has no ChatId key.');
        return;
      }
      if ('undefined' === typeof message.startPositions) {
        console.log('Error: Message has no startPositions key.');
        return;
      }
      if ('undefined' === typeof message.token) {
        console.log('Error: Message has no token key.');
        return;
      }
      if ('undefined' === typeof message.tokenInvite) {
        console.log('Error: Message has no tokenInvite key.');
        return;
      }
      ClassList(document.getElementById('chooseOuter'), 'add', 'none');
      ClassList(document.getElementById('startGameWaiting'), 'add', 'hidden');
      RestoreValue(document.getElementById('startGame'));
      activePlayer = 'White';
      ChatId = message.ChatId;
      if (document.getElementById('asideMessagesOld')) {
        Attribute(document.getElementById('asideMessagesOld'), 'textContent', '');
        if ('undefined' !== typeof ChatDateTimer) {
          clearTimeout(ChatDateTimer);
          ChatDateTimer = undefined;
        }
        ChatDate();
      }
      ClassList(document.getElementById('asidePartner'), 'remove', 'none');
      ClassList(document.getElementById('asideStatus'), 'remove', 'none');
      mode = 'online';
      Places = [message.startPositions];
      PlaceFigures();
      localStorage.setItem('color', color);
      Attribute(document.getElementById('invitationLink'), 'value', location.protocol + '//' + location.host + '/?token=' + message.tokenInvite);
      ClassList(document.getElementById('invitationLinkOuter'), 'remove', 'none');
      AsidePartner('offline');
      ClassList(document.getElementById('asideChat'), 'remove', 'none');
      // Add history state and token to query string.
      window.history.pushState({}, '', '/?token=' + message.token);
    }
  };
}
// Add CSRF header if CSRF meta element is present.
function AddCSRFHeader(req) {
  for (let meta = document.getElementsByTagName('meta'), i = meta.length - 1; 0 <= i; --i) {
    if (meta[i].name && 'csrf-token' == meta[i].name.toLowerCase() && meta[i].content) {
      req.setRequestHeader('X-CSRF-Token', meta[i].content);
      break;
    }
  }
}
// Contact subdomain only accessible over IPv4 or IPv6 with IP version that was not used when loading this page to save IP address for both versions on server.
// Server checks IP Adress when validating token for websocket connection. Loading this page and websocket connection can use different IP versions.
// If this request fails only one IP version is supported and start websocket connection anyway.
function GetIP(IPURL, token, message) {
  let req = new XMLHttpRequest, This = this;
  req.addEventListener('readystatechange', function() {
    3 < req.readyState && StartWS(token, message);
  });
  req.addEventListener('timeout', function() {
    console.log('Error: timeout');
    StartWS(token, message);
  });
  req.open('GET', IPURL + '?token=' + token);
  req.responseType = 'json';
  AddCSRFHeader(req);
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  req.send();
}
// Restore value from custom attribute.
function RestoreValue(elem) {
  if (elem) {
    elem.value = elem.getAttribute('data-value');
    elem.removeAttribute('disabled');
  }
}
// Start game in offline mode.
function StartGameOffline() {
  mode = 'offline';
  activePlayer = color = 'White';
  MoveId = 0;
  Places = ['RNBQKBNRPPPPPPPP                                pppppppprnbqkbnr']; // start positions of all figures
  PlaceFigures();
  WSClose();
  ClassList(document.getElementById('chooseOuter'), 'add', 'none');
  ClassList(document.getElementById('invitationLinkOuter'), 'add', 'none');
  ClassList(document.getElementById('asideChat'), 'add', 'none');
  ClassList(document.getElementById('asideNavLeft'), 'add', 'hidden');
  ClassList(document.getElementById('asideNavRight'), 'add', 'hidden');
  ClassList(document.getElementById('asidePartner'), 'add', 'none');
  ClassList(document.getElementById('asideCheck'), 'add', 'none');
  ClassList(document.getElementById('asideChoose'), 'add', 'none');
  ClassList(document.getElementById('asideMessage'), 'add', 'none');
  document.getElementById('settingsStartGame') && (document.getElementById('settingsStartGame').checked = false);
  AsideStatus(color);
  ClassList(document.getElementById('asideStatus'), 'remove', 'none');
  let params = new URLSearchParams(location.search);
  // If token in query string exists remove it and add history state.
  params.get('token') && window.history.pushState({}, '', '/');
}
// Start game in online mode.
function StartGame(message) {
  mode = 'online';
  Reset(); // reset global variables
  if ('undefined' === typeof message
  || 'undefined' === typeof message.command) { // reconnect
    PlaceFigures();
    WSClose();
  }
  if (this !== window) { // start game button was used
    this.style.width = getComputedStyle(this).width;
    this.setAttribute('disabled', 'disabled');
    this.value = 'Please wait';
    for (let i = 0, j = document.getElementById('chooseOuter').getElementsByTagName('input'); i < j.length; ++i) {
      j[i].setAttribute('disabled', 'disabled');
    }
    ClassList(document.getElementById('startGameWaiting'), 'remove', 'hidden');
    ClassList(document.getElementById('invitationLinkOuter'), 'add', 'none');
    ClassList(document.getElementById('asidePartner'), 'add', 'none');
    ClassList(document.getElementById('asideStatus'), 'add', 'none');
    ClassList(document.getElementById('asideMessage'), 'add', 'none');
    Attribute(document.getElementById('asideMessage'), 'textContent', '');
    document.getElementById('settingsStartGame') && (document.getElementById('settingsStartGame').checked = false);
    color = document.getElementById('chooseColorBlack').checked ? 'Black' : 'White';
  } else { // joining existing game
    let params = new URLSearchParams(location.search);
    color = params.get('token') && 'b' === params.get('token')[0] ? 'Black' : 'White';
  }
  let req = new XMLHttpRequest, This = this;
  req.addEventListener('readystatechange', function() {
    if (3 < req.readyState) {
      if (200 === req.status) {
        let res = 'json' === req.responseType ? req.response : JSON.parse(req.responseText);
        if (!res.IPURL
        || !res.token) {
          if (This !== window) {
            This.value = 'Error';
            setTimeout(function(){RestoreValue(This)}, 3E3);
            for (let i = 0, j = document.getElementById('chooseOuter').getElementsByTagName('input'); i < j.length; ++i) {
              j[i].removeAttribute('disabled');
            }
          }
          return;
        }
        GetIP(res.IPURL, res.token, 'undefined' !== typeof message && message.command ? message : {color: color, command: 'start'});
      } else {
        if (This !== window) {
          if (0 === req.status) {                                               // progressive web app
            for (let i = 0, j = document.getElementById('chooseOuter').getElementsByTagName('input'); i < j.length; ++i) {
              'chooseModeOnline' !== j[i].id && j[i].removeAttribute('disabled');
            }
            ClassList(document.getElementById('startGameWaiting'), 'add', 'hidden');
            document.getElementById('chooseModeOffline') && document.getElementById('chooseModeOffline').click();
            This.value = 'Error: You are offline.';
          } else {
            for (let i = 0, j = document.getElementById('chooseOuter').getElementsByTagName('input'); i < j.length; ++i) {
              j[i].removeAttribute('disabled');
            }
            This.value = 'Error';
          }
          setTimeout(function(){RestoreValue(This)}, 3E3);
        }
        0 !== req.status && StartGame(message);
      }
    }
  });
  req.addEventListener('timeout', function() {
    console.log('Error: timeout');
  });
  req.open('GET', '/start');
  req.responseType = 'json';
  //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  AddCSRFHeader(req);
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  req.send();
}
document.getElementById('startGame') && document.getElementById('startGame').addEventListener('click', document.getElementById('chooseModeOnline').checked ? StartGame : StartGameOffline);
// If token parameter in query string exists join game automatically.
let params = new URLSearchParams(location.search);
if (params.get('token')
&& document.getElementById('IPURL')
&& document.getElementById('tokenWS')) {
  GetIP(document.getElementById('IPURL').textContent, document.getElementById('tokenWS').textContent, {command: 'tokenInvite', tokenInvite: params.get('token')});
}
// Client moved back or forward in history.
function Popstate() {
  WSClose();
  ClassList(document.getElementById('invitationLinkOuter'), 'add', 'none');
  let params = new URLSearchParams(location.search);
  // Offline mode or no game started.
  if (!params.get('token')) {
    Reset();
    mode = 'offline';
    PlaceFigures();
    ClassList(document.getElementById('asideChat'), 'add', 'none');
    ClassList(document.getElementById('asidePartner'), 'add', 'none');
    ClassList(document.getElementById('asideStatus'), 'add', 'none');
    Attribute(document.getElementById('asidePartner'), 'textContent', '');
    Attribute(document.getElementById('asideStatus'), 'textContent', '');
    ClassList(document.getElementById('settingsInvitationLinkOuter'), 'add', 'none');
    document.getElementById('settingsInvitationLink') && (document.getElementById('settingsInvitationLink').checked = false);
    ClassList(document.getElementById('startGameWarning'), 'add', 'hidden');
    if (document.getElementById('startGame')) {
      document.getElementById('startGame').removeAttribute('disabled');
      RestoreValue(document.getElementById('startGame'));
    }
    if (document.getElementById('chooseOuter')) {
      ClassList(document.getElementById('chooseOuter'), 'remove', 'none');
      for (let i = 0, j = document.getElementById('chooseOuter').getElementsByTagName('input'); i < j.length; ++i) {
        j[i].removeAttribute('disabled');
      }
    }
    return;
  }
  // Token parameter in query string exists. Join game in online mode.
  mode = 'online';
  ClassList(document.getElementById('chooseOuter'), 'add', 'none');
  let req = new XMLHttpRequest, This = this;
  req.addEventListener('readystatechange', function() {
    if (3 < req.readyState) {
      if (200 === req.status) {
        let res = 'json' === req.responseType ? req.response : JSON.parse(req.responseText);
        if (!res.IPURL
        || !res.token) {
          console.log('Error: missing keys.');
          return;
        }
        GetIP(res.IPURL, res.token, {command: 'tokenInvite', tokenInvite: params.get('token')});
      } else {
        console.log('Error: ' + res.status);
      }
    }
  });
  req.addEventListener('timeout', function() {
    console.log('Error: timeout');
  });
  req.open('GET', '/start');
  req.responseType = 'json';
  AddCSRFHeader(req);
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  req.send();
  ClassList(document.getElementById('settingsInvitationLinkOuter'), 'remove', 'none');
  ClassList(document.getElementById('asideMessage'), 'add', 'none');
  Attribute(document.getElementById('asideMessage'), 'textContent', '');
}
window.addEventListener('popstate', Popstate);
// Add chat message.
function ChatAdd(date, now, value, divClass) {
  let span = document.createElement('span');
  span.classList.add('chatDate');
  span.setAttribute('data-date', date),
  span.textContent = ChatDateChange(now - date);
  document.getElementById('asideMessagesOld').appendChild(span);
  let div = document.createElement('div'),
      textarea = document.createElement('textarea');
  div.classList.add(divClass);
  textarea.classList.add('chatTextarea');
  textarea.disabled = 'disabled';
  textarea.rows = '1';
  textarea.value = value;
  div.appendChild(textarea);
  document.getElementById('asideMessagesOld').appendChild(div);
  TextareaEntire(textarea);
  document.getElementById('asideMessagesOld').scrollTop = document.getElementById('asideMessagesOld').scrollHeight;
}
// Enlarge textarea until complete content is visible.
function TextareaEntire(elem) {
    let rows;
    if ((rows = elem.rows) && !isNaN(rows = parseInt(rows))) {
        for ( ; elem.scrollHeight > elem.clientHeight; ) {
            elem.rows = ++rows;
        }
    }
}
// Resize textarea to avoid scrolling.
function TextareaResize() {
  let rows;
  if ((rows = this.rows) && !isNaN(rows = parseInt(rows))) {
    if (this.scrollHeight > this.clientHeight) {
      for ( ; 11 > rows; ) { // max 10 rows
        this.rows = ++rows;
        if (this.scrollHeight <= this.clientHeight) {
          break;
        }
      }
    } else {
      for ( ; 1 < rows; ) {
        this.rows = --rows;
        if (this.scrollHeight > this.clientHeight) {
          this.rows = ++rows;
          break;
        }
      }
    }
  }
}
// Send message if enter key is pressed but not shift key.
function TextareaEnter(e) {
  if (13 !== e.keyCode
  || e.shiftKey) {
    return;
  }
  e.preventDefault();
  let value = this.value;
  if ('' === value.replace(/\s/g, '')) {
    return;
  }
  if ('undefined' === typeof WS
  || 1 !== WS.readyState) {
    return;
  }
  WS.send(JSON.stringify({
    ChatId: ChatId++,
    command: 'message',
    message: value
  }));
  this.value = '';
  this.rows = '1';
  if (!document.getElementById('asideMessagesOld')) {
    return;
  }
  let now = Math.round((new Date).getTime() / 1E3);
  ChatAdd(now, now, value, 'chatTextareaOuterSelf');
}
// Add event listeners to message input.
if (document.getElementById('asideMessageNew')) {
  document.getElementById('asideMessageNew').addEventListener('input', TextareaResize);
  document.getElementById('asideMessageNew').addEventListener('keypress', TextareaEnter);
}
// Calculate text for age of messages.
function ChatDateChange(seconds) {
  let content, days, hours, minutes;
  if (60 > seconds) {
    content = 'just now';
  } else if (3600 > seconds) {
    content = '' + (minutes = Math.floor(seconds / 60)) + ' minute' + (1 < minutes ? 's' : '') + ' ago';
  } else if (86400 > seconds) {
    content = '' + (hours = Math.floor(seconds / 3600)) + ' hour' + (1 < hours ? 's' : '') + ' ago';
  } else {
    content = '' + (days = Math.floor(seconds / 86400)) + ' day' + (1 < days ? 's' : '') + ' ago';
  }
  return content;
}
// Calculate age of messages every second in online mode.
function ChatDate() {
  ChatDateTimer = setTimeout(ChatDate, 1E3);
  if (!document.getElementById('asideMessagesOld')) {
    return;
  }
  let now = Math.round((new Date).getTime() / 1E3);
  for (let i = 0, j = document.getElementById('asideMessagesOld').querySelectorAll('.chatDate'); i < j.length; ++i) {
    if (!j[i].getAttribute('data-date')) {
      continue;
    }
    let content = ChatDateChange(now - parseInt(j[i].getAttribute('data-date')));
    content !== j[i].textContent && (j[i].textContent = content);
  }
}
// Hide possible fields to go to when option is deactivated in overlay or loaded from local storage.
function HidePossibleFieldStyles() {
  let elem = document.createElement('style');
  elem.classList.add('hidePossibleFields');
  document.head.appendChild(elem);
  let styleSheet = elem.sheet;
  styleSheet.insertRule(
    '.BoardPossibleBright {'
      +'box-shadow: unset !important;'
    +'}',
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    '.BoardPossibleDark {'
      +'box-shadow: unset !important;'
    +'}',
    styleSheet.cssRules.length
  );
}
// Option to display or hide possible fields to go to in overlay.
function SettingsPossibleFields() {
  if (this.checked) {
    RemoveObsoleteStyles('hidePossibleFields', 1);
    localStorage.removeItem('hidePossibleFields');
  } else {
    HidePossibleFieldStyles();
    RemoveObsoleteStyles('hidePossibleFields');
    localStorage.setItem('hidePossibleFields', '1');
  }
}
// Hide possible fields to go to when loading page.
if ('string' === typeof localStorage.getItem('hidePossibleFields')) {
  HidePossibleFieldStyles();
  document.getElementById('settingsPossibleFields') && (document.getElementById('settingsPossibleFields').checked = false);
}
document.getElementById('settingsPossibleFields') && document.getElementById('settingsPossibleFields').addEventListener('click', SettingsPossibleFields);
// Register the service worker.
if ('serviceWorker' in navigator) {
  // Wait for the 'load' event to not block other work.
  window.addEventListener('load', async () => {
    // Try to register the service worker.
    try {
      // Capture the registration for later use, if needed.
      let reg = await navigator.serviceWorker.register('/serviceWorker.js');
      console.log('Service worker registered!', reg);
    } catch (err) {
      console.log('Service worker registration failed: ', err);
    }
  });
}