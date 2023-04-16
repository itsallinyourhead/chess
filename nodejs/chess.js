#!/usr/bin/env node
const http = require('http'),
      mysql = require('mysql'),
      WebSocketServer = require('websocket').server;
const db = mysql.createPool({
      connectionLimit : 50,
      database        : 'chess',
      debug           :  false,
      host            : 'localhost',
      password        : '123oCm3e74$',
      port            : 8320,
      user            : 'www-data'
});
// Test if string could be converted to JSON.
function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
// Global variables.
Colors = [];
Connections = [];
GameIds = [];
Players = [];
Viewers = [];
let server = http.createServer(function(request, response) {
      console.log('Rejected request for ' + request.url);
      response.writeHead(404);
      response.end();
    });
server.listen(5001, function() {
  console.log('Server is listening on port 5001');
});
wsServer = new WebSocketServer({
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false,
  httpServer: server,
  maxPayload: 128 * 1024, // 128 KB
});
// Test check status.
function Check(Figure, NewId, OldId, positionsOld) {
  let a, b,
      Color = 0 <= 'BKNPQR'.indexOf(Figure) ? 'Black' : 'White',
      KingId = positionsOld.indexOf('Black' === Color ? 'k' : 'K');
  if (0 > KingId) {
    return true;
  }
  for (a = KingId + 8, b = ' '; ' ' === b && 64 > a;              a += 8) {     // down
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      return true;
    }
  }
  for (a = KingId + 7, b = ' '; ' ' === b && 64 > a && 7 > a % 8; a += 7) {     // down left
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      return true;
    }
  }
  for (a = KingId + 9, b = ' '; ' ' === b && 64 > a && 0 < a % 8; a += 9) {     // down right
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      return true;
    }
  }
  for (a = KingId - 1, b = ' '; ' ' === b &&           7 > a % 8;    --a) {     // left
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      return true;
    }
  }
  for (a = KingId + 1, b = ' '; ' ' === b &&           0 < a % 8;    ++a) {     // right
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      return true;
    }
  }
  for (a = KingId - 8, b = ' '; ' ' === b && 0 <= a;              a -= 8) {     // up
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'QR' : 'qr').indexOf(b)) {
      return true;
    }
  }
  for (a = KingId - 9, b = ' '; ' ' === b && 0 <= a && 7 > a % 8; a -= 9) {     // up left
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      return true;
    }
  }
  for (a = KingId - 7, b = ' '; ' ' === b && 0 <= a && 0 < a % 8; a -= 7) {     // up right
    if (' ' !== (b = positionsOld[a])
    && 0 <= ('Black' === Color ? 'BQ' : 'bq').indexOf(b)) {
      return true;
    }
  }
  if ('Black' === Color) {                                                      // Black pawn
    if (8 < KingId && 0 < KingId % 8 && 'P' === positionsOld[KingId - 9]) {     // Black pawn up left
      return true;
    }
    if (7 < KingId && 7 > KingId % 8 && 'P' === positionsOld[KingId - 7]) {     // Black pawn up right
      return true;
    }
  } else {                                                                      // White pawn
    if (56 > KingId && 0 < KingId % 8 && 'p' === positionsOld[KingId + 7]) {    // White pawn down left
      return true;
    }
    if (55 > KingId && 7 > KingId % 8 && 'p' === positionsOld[KingId + 9]) {    // White pawn down right
      return true;
    }
  }
  if (48 > KingId && 0 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId + 15]) {// knight down left
    return true;
  }
  if (47 > KingId && 7 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId + 17]) {// knight down right
    return true;
  }
  if (56 > KingId && 1 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId +  6]) {// knight left down
    return true;
  }
  if ( 9 < KingId && 1 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId - 10]) {// knight left up
    return true;
  }
  if ( 7 < KingId && 6 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId -  6]) {// knight right up
    return true;
  }
  if (54 > KingId && 6 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId + 10]) {// knight right up
    return true;
  }
  if ( 6 < KingId && 0 < KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId - 17]) {// knight up left
    return true;
  }
  if (15 < KingId && 7 > KingId % 8 && ('Black' === Color ? 'N' : 'n') === positionsOld[KingId - 15]) {// knight up right
    return true;
  }
  if (56 > KingId &&                   ('Black' === Color ? 'K' : 'k') === positionsOld[KingId + 8]) {// king down
    return true;
  }
  if (56 > KingId && 0 < KingId % 8 && ('Black' === Color ? 'K' : 'k') === positionsOld[KingId + 7]) {// king down left
    return true;
  }
  if (55 > KingId && 7 > KingId % 8 && ('Black' === Color ? 'K' : 'k') === positionsOld[KingId + 9]) {// king down right
    return true;
  }
  if (               0 < KingId % 8 && ('Black' === Color ? 'K' : 'k') === positionsOld[KingId - 1]) {// king left
    return true;
  }
  if (               7 > KingId % 8 && ('Black' === Color ? 'K' : 'k') === positionsOld[KingId + 1]) {// king right
    return true;
  }
  if ( 7 < KingId &&                   ('Black' === Color ? 'K' : 'k') === positionsOld[KingId - 8]) {// king up
    return true;
  }
  if ( 8 < KingId && 0 < KingId % 8 && ('Black' === Color ? 'K' : 'k') === positionsOld[KingId - 9]) {// king up left
    return true;
  }
  if ( 7 < KingId && 7 > KingId % 8 && ('Black' === Color ? 'K' : 'k') === positionsOld[KingId - 7]) {// king up right
    return true;
  }
  return false;
}
// Test if figue from OldId could go to NewId.
function MarkerField(NewId, OldId, positionsOld) {
  let Figure = positionsOld[OldId],
      place = positionsOld[NewId];
  if (' ' === place
  || (0 <= 'BKNPQR'.indexOf(Figure) && 0 <= 'bknpqr'.indexOf(place))
  || (0 <= 'bknpqr'.indexOf(Figure) && 0 <= 'BKNPQR'.indexOf(place))) {
    return [place, 1];
  }
  return [place, 0];
}
// Calculate hypothetically positions if figure would move form OldId to NewId.
function PlaceboPositions(Figure, NewId, OldId, positions) {
  positions = positions.substring(0, OldId) + ' ' + positions.substring(OldId + 1);
  return positions.substring(0, NewId) + Figure + positions.substring(NewId + 1);
}
// Test other players check status and remi status.
function Marker(Figure, Id, lastHistory, positions) {
  let a, b,
      FigureOther = 0 <= 'bknpqr'.indexOf(Figure) ? Figure.toUpperCase() : Figure.toLowerCase(),
      FigureSmall = Figure.toLowerCase();
  if ('b' === FigureSmall) {                                                    // bishop
    for (a = Id + 7, b = ' '; ' ' === b && 64 >  a && 7 > a % 8; a += 7) {      // bishop down left
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id + 9, b = ' '; ' ' === b && 64 >  a && 0 < a % 8; a += 9) {      // bishop down right
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 9, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8; a -= 9) {      // bishop up left
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 7, b = ' '; ' ' === b &&  0 <= a && 0 < a % 8; a -= 7) {      // bishop up right
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
  } else if ('k' === FigureSmall) {                                             // king
     if (56 > Id &&               MarkerField(a = Id +  8, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king down
     if (56 > Id && 0 < Id % 8 && MarkerField(a = Id +  7, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king down left
     if (55 > Id && 7 > Id % 8 && MarkerField(a = Id +  9, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king down right
                if (0 < Id % 8 && MarkerField(a = Id -  1, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king left
                if (7 > Id % 8 && MarkerField(a = Id +  1, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king right
     if ( 7 < Id &&               MarkerField(a = Id -  8, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king up
     if ( 8 < Id && 0 < Id % 8 && MarkerField(a = Id -  9, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king up left
     if ( 7 < Id && 7 > Id % 8 && MarkerField(a = Id -  7, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// king up right
  } else if ('n' === FigureSmall) {                                             // knight
     if (48 > Id && 0 < Id % 8 && MarkerField(a = Id + 15, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight down left
     if (47 > Id && 7 > Id % 8 && MarkerField(a = Id + 17, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight down right
     if (56 > Id && 1 < Id % 8 && MarkerField(a = Id +  6, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight left down
     if ( 9 < Id && 1 < Id % 8 && MarkerField(a = Id - 10, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight left up
     if (54 > Id && 6 > Id % 8 && MarkerField(a = Id + 10, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight right down
     if ( 7 < Id && 6 > Id % 8 && MarkerField(a = Id -  6, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight right up
     if (16 < Id && 0 < Id % 8 && MarkerField(a = Id - 17, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight up left
     if (15 < Id && 7 > Id % 8 && MarkerField(a = Id - 15, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// knight up right
  } else if ('p' === FigureSmall) {                                             // pawn
    if ('P' === Figure) {                                                       // Black pawn
      if (0 < Id % 8 && 0 <= 'bknpqr'.indexOf(positions[Id + 7])) {             // Black pawn down left
        if (MarkerField(a = Id + 7, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
      }
      if (55 > Id && 7 > Id % 8 && 0 <= 'bknpqr'.indexOf(positions[Id + 9])) {  // Black pawn down right
        if (MarkerField(a = Id + 9, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
      }
      if (' ' === positions[Id + 8]) {
        if (MarkerField(a = Id + 8, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// Black pawn down
        if (16 > Id && ' ' === positions[Id + 16] && MarkerField(Id + 16, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// Black pawn two fields down
      }
      if (31 < Id && 40 > Id) {                                                 // Black pawn en passant
        if ('p' + (Id + 15) + '-' + (Id - 1) === lastHistory) {                 // Black pawn en passant left
          if (MarkerField(a = Id + 7, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
        } else if ('p' + (Id + 17) + '-' + (Id + 1) === lastHistory) {          // Black pawn en passant right
          if (MarkerField(a = Id + 9, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
        }
      }
    } else {                                                                    // White pawn
      if (8 < Id && 0 < Id % 8 && 0 <= 'BKNPQR'.indexOf(positions[Id - 9])) {   // White pawn up left
        if (MarkerField(a = Id - 9, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
      }
      if (7 > Id % 8 && 0 <= 'BKNPQR'.indexOf(positions[Id - 7])) {             // White pawn up right
        if (MarkerField(a = Id - 7, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
      }
      if (' ' === positions[Id - 8]) {
        if (MarkerField(a = Id - 8, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// White pawn up
        if (47 < Id && ' ' === positions[Id - 16] && MarkerField(a = Id - 16, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}// White pawn two fields up
      }
      if (23 < Id && 32 > Id) {                                                 // White pawn en passant
        if ('P' + (Id - 17) + '-' + (Id - 1) === lastHistory) {                 // White pawn en passant left
          if (MarkerField(a = Id - 9, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
        } else if ('P' + (Id - 15) + '-' + (Id + 1) === lastHistory) {          // White pawn en passant right
          if (MarkerField(a = Id - 7, Id, positions)[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {return true;}
        }
      }
    }
  } else if ('q' === FigureSmall) {                                             // queen
    for (a = Id + 8, b = ' '; ' ' === b && 64 >  a;              a += 8) {      // queen down
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id + 7, b = ' '; ' ' === b && 64 >  a && 7 > a % 8; a += 7) {      // queen down left
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id + 9, b = ' '; ' ' === b && 64 >  a && 0 < a % 8; a += 9) {      // queen down right
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 1, b = ' '; ' ' === b &&            7 > a % 8;    --a) {      // queen left
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id + 1, b = ' '; ' ' === b &&            0 < a % 8;    ++a) {      // queen right
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 8, b = ' '; ' ' === b &&  0 <= a;              a -= 8) {      // queen up
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 9, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8; a -= 9) {      // queen up left
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 7, b = ' '; ' ' === b &&  0 <= a && 0 < a % 8; a -= 7) {      // queen up right
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
  } else if ('r' === FigureSmall) {                                             // rook
    for (a = Id + 8, b = ' '; ' ' === b && 64 >  a;              a += 8) {      // rook down
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 1, b = ' '; ' ' === b && 0 <= a && 7 > a % 8;    --a) {      // rook left
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id + 1, b = ' '; ' ' === b &&            0 < a % 8;    ++a) {      // rook right
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
    for (a = Id - 8, b = ' '; ' ' === b &&  0 <= a;              a -= 8) {      // rook up
      c = MarkerField(a, Id, positions);
      b = c[0];
      if (c[1] && !Check(FigureOther, a, Id, PlaceboPositions(Figure, a, Id, positions))) {
        return true;
      }
    }
  }
  return false;
}
// Calculate possible fields to go to.
function MarkField(NewId, OldId, positionsOld) {
  let Figure = positionsOld[OldId],
      place = positionsOld[NewId];
  if (Check(Figure, NewId, OldId, positionsOld)) {
    return [place, 0];
  }
  if (' ' === place
  || (0 <= 'BKNPQR'.indexOf(Figure) && 0 <= 'bknpqr'.indexOf(place))
  || (0 <= 'bknpqr'.indexOf(Figure) && 0 <= 'BKNPQR'.indexOf(place))) {
    return [place, 1];
  }
  return [place, 0];
}
// Validate received move.
function ValidateMove(message, historyPenultimate, moveId, positionsOld, CastleBlackLeft, CastleBlackRight, CastleWhiteLeft, CastleWhiteRight) {
  if ('undefined' === typeof message.Figure
  || 'undefined' === typeof message.NewId
  || 'undefined' === typeof message.OldId
  || 'undefined' === typeof message.positions) {
    console.log('Error: Invalid move. Missing key.');
    return [false];
  }
  let a, b, c,
      Figure = message.Figure,
      FigureSmall = Figure.toLowerCase(),
      NewId = message.NewId,
      NewIds = [], // will contain ids of all possible fields
      OldId = message.OldId,
      positionsNew,
      special = ''; // not empty if special move was made (castle, en passant or replacing pawn)
  positionsNew = positionsOld.substring(0, OldId) + ' ' + positionsOld.substring(OldId + 1);
  positionsNew = positionsNew.substring(0, NewId) + Figure + positionsNew.substring(NewId + 1);
  if ('b' === FigureSmall) {                                                    // bishop
    for (a = OldId + 7, b = ' '; ' ' === b && 64 >  a && 7 > a % 8; a += 7) {   // bishop down left
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId + 9, b = ' '; ' ' === b && 64 >  a && 0 < a % 8; a += 9) {   // bishop down right
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 9, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8; a -= 9) {   // bishop up left
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 7, b = ' '; ' ' === b &&  0 <= a && 0 < a % 8; a -= 7) {   // bishop up right
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
  } else if ('k' === FigureSmall) {                                             // king
     56 > OldId &&                  MarkField(a = OldId +  8, OldId, positionsOld)[1] && NewIds.push(a);// king down
     56 > OldId && 0 < OldId % 8 && MarkField(a = OldId +  7, OldId, positionsOld)[1] && NewIds.push(a);// king down left
     55 > OldId && 7 > OldId % 8 && MarkField(a = OldId +  9, OldId, positionsOld)[1] && NewIds.push(a);// king down right
                   0 < OldId % 8 && MarkField(a = OldId -  1, OldId, positionsOld)[1] && NewIds.push(a);// king left
                   7 > OldId % 8 && MarkField(a = OldId +  1, OldId, positionsOld)[1] && NewIds.push(a);// king right
      7 < OldId &&                  MarkField(a = OldId -  8, OldId, positionsOld)[1] && NewIds.push(a);// king up
      8 < OldId && 0 < OldId % 8 && MarkField(a = OldId -  9, OldId, positionsOld)[1] && NewIds.push(a);// king up left
      7 < OldId && 7 > OldId % 8 && MarkField(a = OldId -  7, OldId, positionsOld)[1] && NewIds.push(a);// king up right
  } else if ('n' === FigureSmall) {                                             // knight
     48 > OldId && 0 < OldId % 8 && MarkField(a = OldId + 15, OldId, positionsOld)[1] && NewIds.push(a);// knight down left
     47 > OldId && 7 > OldId % 8 && MarkField(a = OldId + 17, OldId, positionsOld)[1] && NewIds.push(a);// knight down right
     56 > OldId && 1 < OldId % 8 && MarkField(a = OldId +  6, OldId, positionsOld)[1] && NewIds.push(a);// knight left down
      9 < OldId && 1 < OldId % 8 && MarkField(a = OldId - 10, OldId, positionsOld)[1] && NewIds.push(a);// knight left up
     54 > OldId && 6 > OldId % 8 && MarkField(a = OldId + 10, OldId, positionsOld)[1] && NewIds.push(a);// knight right down
      7 < OldId && 6 > OldId % 8 && MarkField(a = OldId -  6, OldId, positionsOld)[1] && NewIds.push(a);// knight right up
     16 < OldId && 0 < OldId % 8 && MarkField(a = OldId - 17, OldId, positionsOld)[1] && NewIds.push(a);// knight up left
     15 < OldId && 7 > OldId % 8 && MarkField(a = OldId - 15, OldId, positionsOld)[1] && NewIds.push(a);// knight up right
  } else if ('p' === FigureSmall) {                                             // pawn
    if ('P' === Figure) {                                                       // Black pawn
      if (0 < OldId % 8 && 0 <= 'bknpqr'.indexOf(positionsOld[OldId + 7])) {    // Black pawn down left
        MarkField(a = OldId  + 7, OldId, positionsOld)[1] && NewIds.push(a);
      }
      if (55 > OldId && 7 > OldId % 8 && 0 <= 'bknpqr'.indexOf(positionsOld[OldId + 9])) {// Black pawn down right
        MarkField(a = OldId + 9, OldId, positionsOld)[1] && NewIds.push(a);
      }
      if (' ' === positionsOld[OldId + 8]) {
        MarkField(a = OldId + 8, OldId, positionsOld)[1] && NewIds.push(a);     // Black pawn down
        16 > OldId && ' ' === positionsOld[OldId + 16] && MarkField(a = OldId + 16, OldId, positionsOld)[1] && NewIds.push(a);// Black pawn two fields down
      }
      if (31 < OldId && 40 > OldId && (a = historyPenultimate)) {               // Black pawn en passant
        if ('p' + (OldId + 15) + '-' + (OldId - 1) === a) {                     // Black pawn en passant left
          if (NewId === OldId + 7
          && MarkField(b = OldId + 7, OldId, positionsOld)[1]) {
            NewIds.push(b);
            positionsNew = positionsNew.substring(0, b - 8) + ' ' + positionsNew.substring(b - 7);
            special = '-EP';
          }
        } else if ('p' + (OldId + 17) + '-' + (OldId + 1) === a) {              // Black pawn en passant right
          if (NewId === OldId + 9
          && MarkField(b = OldId + 9, OldId, positionsOld)[1]) {
            NewIds.push(b);
            positionsNew = positionsNew.substring(0, b - 8) + ' ' + positionsNew.substring(b - 7);
            special = '-EP';
          }
        }
      }
    } else {                                                                    // White pawn
      if (8 < OldId && 0 < OldId % 8 && 0 <= 'BKNPQR'.indexOf(positionsOld[OldId - 9])) {// White pawn up left
        MarkField(a = OldId - 9, OldId, positionsOld)[1] && NewIds.push(a);
      }
      if (7 > OldId % 8 && 0 <= 'BKNPQR'.indexOf(positionsOld[OldId - 7])) {    // White pawn up right
        MarkField(a = OldId - 7, OldId, positionsOld)[1] && NewIds.push(a);
      }
      if (' ' === positionsOld[OldId - 8]) {
        MarkField(a = OldId - 8, OldId, positionsOld)[1] && NewIds.push(a);     // White pawn up
        47 < OldId && ' ' === positionsOld[OldId - 16] && MarkField(a = OldId - 16, OldId, positionsOld)[1] && NewIds.push(a);// White pawn two fields up
      }
      if (23 < OldId && 32 > OldId && (a = historyPenultimate)) {               // White pawn en passant
        if ('P' + (OldId - 17) + '-' + (OldId - 1) === a) {                     // White pawn en passant left
          if (NewId === OldId - 9
          && MarkField(b = OldId - 9, OldId, positionsOld)[1]) {
            NewIds.push(b);
            positionsNew = positionsNew.substring(0, b + 8) + ' ' + positionsNew.substring(b + 9);
            special = '-EP';
          }
        } else if ('P' + (OldId - 15) + '-' + (OldId + 1) === a) {              // White pawn en passant right
          if (NewId === OldId - 7
          && MarkField(b = OldId - 7, OldId, positionsOld)[1]) {
            NewIds.push(b);
            positionsNew = positionsNew.substring(0, b + 8) + ' ' + positionsNew.substring(b + 9);
            special = '-EP';
          }
        }
      }
    }
  } else if ('q' === FigureSmall) {                                             // queen
    for (a = OldId + 8, b = ' '; ' ' === b && 64 >  a;              a += 8) {   // queen down
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId + 7, b = ' '; ' ' === b && 64 >  a && 7 > a % 8; a += 7) {   // queen down left
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId + 9, b = ' '; ' ' === b && 64 >  a && 0 < a % 8; a += 9) {   // queen down right
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 1, b = ' '; ' ' === b &&            7 > a % 8;    --a) {   // queen left
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId + 1, b = ' '; ' ' === b &&            0 < a % 8;    ++a) {   // queen right
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 8, b = ' '; ' ' === b &&  0 <= a;              a -= 8) {   // queen up
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 9, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8; a -= 9) {   // queen up left
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 7, b = ' '; ' ' === b &&  0 <= a && 0 < a % 8; a -= 7) {   // queen up right
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
  } else if ('r' === FigureSmall) {                                             // rook
    for (a = OldId + 8, b = ' '; ' ' === b && 64 >  a;              a += 8) {   // rook down
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 1, b = ' '; ' ' === b &&  0 <= a && 7 > a % 8;    --a) {   // rook left
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId + 1, b = ' '; ' ' === b &&            0 < a % 8;    ++a) {   // rook right
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
    for (a = OldId - 8, b = ' '; ' ' === b &&  0 <= a;              a -= 8) {   // rook up
      c = MarkField(a, OldId, positionsOld);
      b = c[0];
      c[1] && NewIds.push(a);
    }
  }
  if ('P' === Figure && 55 < NewId) {                                           // replace pawn Black
    if ('undefined' === typeof message.special
    || ('-RP-Q' !== message.special) && ('-RP-R' !== message.special) && ('-RP-B' !== message.special) && ('-RP-N' !== message.special)) {
      return [false];
    }
    positionsNew = positionsNew.substring(0, NewId) + message.special[message.special.length - 1] + positionsNew.substring(NewId + 1);
    special = message.special;
  } else if ('p' === Figure && 8 > NewId) {                                     // replace pawn White
    if ('undefined' === typeof message.special
    || ('-RP-q' !== message.special) && ('-RP-r' !== message.special) && ('-RP-b' !== message.special) && ('-RP-n' !== message.special)) {
      return [false];
    }
    positionsNew = positionsNew.substring(0, NewId) + message.special[message.special.length - 1] + positionsNew.substring(NewId + 1);
    special = message.special;
  } else if ('K' === Figure) {                                                  // Castle: Black king
    (null === CastleBlackLeft || moveId < CastleBlackLeft) && (CastleBlackLeft = moveId + 1);
    (null === CastleBlackRight || moveId < CastleBlackRight) && (CastleBlackRight = moveId + 1);
  } else if ('k' === Figure) {                                                  // Castle: White king
    (null === CastleWhiteLeft || moveId < CastleWhiteLeft) && (CastleWhiteLeft = moveId + 1);
    (null === CastleWhiteRight || moveId < CastleWhiteRight) && (CastleWhiteRight = moveId + 1);
  } else if ('R' === Figure) {                                                  // Castle: Black rook
    if (0 === OldId) {
      if (3 === NewId
      && '-K4-2' === message.special
      && (null === CastleBlackLeft || moveId < CastleBlackLeft)
      && ' ' === positionsOld[1]
      && ' ' === positionsOld[2]
      && ' ' === positionsOld[3]
      && !Check('k', 4, 4, PlaceboPositions('k', 4, 4, positionsOld))
      && !Check('k', 3, 4, PlaceboPositions('k', 3, 4, positionsOld))
      && !Check('k', 2, 4, PlaceboPositions('k', 2, 4, positionsOld))) {
        positionsNew = '  KR ' + positionsNew.substring(5);
        special = message.special;
      }
      (null === CastleBlackLeft || moveId < CastleBlackLeft) && (CastleBlackLeft = moveId + 1);
    } else if (7 === OldId) {
      if (5 === NewId
      && '-K4-6' === message.special
      && (null === CastleBlackRight || moveId <= CastleBlackRight)
      && ' ' === positionsOld[5]
      && ' ' === positionsOld[6]
      && !Check('k', 4, 4, PlaceboPositions('k', 4, 4, positionsOld))
      && !Check('k', 5, 4, PlaceboPositions('K', 5, 4, positionsOld))
      && !Check('k', 6, 4, PlaceboPositions('K', 6, 4, positionsOld))) {
        positionsNew = positionsNew.substring(0, 4) + ' RK ' + positionsNew.substring(8);
        special = message.special;
      }
      (null === CastleBlackRight || moveId < CastleBlackRight) && (CastleBlackRight = moveId + 1);
    }
  } else if ('r' === Figure) {                                                  // Castle: White rook
    if (56 === OldId) {
      if (59 === NewId
      && '-k60-58' === message.special
      && (null === CastleWhiteLeft || moveId < CastleWhiteLeft)
      && ' ' === positionsOld[57]
      && ' ' === positionsOld[58]
      && ' ' === positionsOld[59]
      && !Check('K', 60, 60, PlaceboPositions('k', 60, 60, positionsOld))
      && !Check('K', 59, 60, PlaceboPositions('k', 59, 60, positionsOld))
      && !Check('K', 58, 60, PlaceboPositions('k', 58, 60, positionsOld))) {
        positionsNew = positionsNew.substring(0, 56) + '  kr ' + positionsNew.substring(61);
        special = message.special;
      }
      (null === CastleWhiteLeft || moveId < CastleWhiteLeft) && (CastleWhiteLeft = moveId + 1);
    } else if (63 === OldId) {
      if (61 === NewId
      && '-k60-62' === message.special
      && (null === CastleWhiteRight || moveId < CastleWhiteRight)
      && ' ' === positionsOld[61]
      && ' ' === positionsOld[62]
      && !Check('K', 60, 60, PlaceboPositions('k', 60, 60, positionsOld))
      && !Check('K', 61, 60, PlaceboPositions('k', 61, 60, positionsOld))
      && !Check('K', 62, 60, PlaceboPositions('k', 62, 60, positionsOld))) {
        positionsNew = positionsNew.substring(0, 60) + ' rk ';
        special = message.special;
      }
      (null === CastleWhiteRight || moveId < CastleWhiteRight) && (CastleWhiteRight = moveId + 1);
    }
  }
  if ('undefined' !== typeof message.special
  && special !== message.special) {
    console.log('Error: message.special invalid.');
    return [false];
  }
  if (positionsNew === message.positions
  && 0 <= NewIds.indexOf(NewId)) {
    return [true, CastleBlackLeft, CastleBlackRight, CastleWhiteLeft, CastleWhiteRight, special];
  }
  console.log('Error: Invalid move.');
  return [false];
}
// Received move was found valid and is send to the other player.
function SendMove(connection, gameId, message) {
  for (let i = 0; i < Viewers[gameId].length; ++i) {
    if (connection !== Viewers[gameId][i]
    && 'open' === Connections[Viewers[gameId][i]].state) {
      Connections[Viewers[gameId][i]].sendUTF(JSON.stringify({
        command: 'move',
        Figure: message.Figure,
        NewId: message.NewId,
        Places: message.positions,
        OldId: message.OldId
      }));
    }
  }
}
// Request is received.
wsServer.on('request', function(request) {
  if ('undefined' === typeof request.resourceURL.query.token) {
    request.reject();
    console.log('Connection rejected due to missing token.');
    return;
  }
  let token = request.resourceURL.query.token;
  if (30 !== token.length) {
    request.reject();
    console.log('Connection rejected due to wrong length of token.');
    return;
  }
  for (let i = 0; i < token.length; ++i) {
    if (0 > '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(token[i])) {
      request.reject();
      console.log('Connection rejected due to invalid token.');
      return;
    }
  }
  if ('undefined' === typeof request.origin
  || 'https://chess.neverwasinparis.com' !== request.origin) {
    request.reject();
    console.log('Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  db.getConnection(function(err, dbConnection) {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      return;
    }
    db.query('SELECT created,id FROM tokens WHERE IPv' + (0 <= request.remoteAddress.indexOf('.') ? '4' : '6') + ' = ? AND token = ?', [request.remoteAddress, token], function (error, results, fields) {
      if (error) {
        dbConnection.release();
        request.reject();
        console.error(error);
        return;
      }
      if (!results.length) {
        dbConnection.release();
        request.reject();
        console.error('Connection rejected due to wrong IP address or token.');
        return;
      }
      // Delete used token from database.
      db.query('DELETE FROM tokens WHERE id = ?', [results[0]['id']], function (error, results, fields) {
        dbConnection.release();
        error && console.error(error);
      });
      if (Math.round(new Date().getTime() / 1E3) - 60 > results[0]['created']) {
        request.reject();
        console.error('Connection rejected due to outdated token.');
        return;
      }
      let connection = 'g' + results[0]['id'] + 'g' + token;
      Connections[connection] = request.accept('echo-protocol', request.origin);
      console.log('Connection accepted from: ' + request.remoteAddress);
      // Message received.
      Connections[connection].on('message', function(message) {
        if ('utf8' !== message.type) {
          console.log('Received message of not allowed type.');
          Connections[connection].close();
          return;
        }
        if (!IsJsonString(message.utf8Data)) {
          console.log('Received message is not JSON.');
          Connections[connection].close();
          return;
        }
        message = JSON.parse(message.utf8Data);
        if ('undefined' === typeof message.command) {
          console.log('Received message has no command key.');
          Connections[connection].close();
          return;
        }
        // Chat message.
        if ('message' === message.command) {
          if ('number' !== typeof message.ChatId
          || 'string' !== typeof message.message) {
            'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
              command: 'error',
              reason: 'Invalid or missing keys.'
            }));
            return;
          }
          let color = Colors[connection],
              gameId = GameIds[connection];
          db.getConnection(function(err, dbConnection) {
            if (err) {
              console.error('Error connecting: ' + err.stack);
              return;
            }
            // Test if chat id exists already.
            db.query('SELECT COUNT(*) AS count FROM chats WHERE ? = ? AND gameId = ? LIMIT 1', ['id' + color, message.ChatId, gameId], function (error, results, fields) {
              if (error) {
                dbConnection.release();
                console.error(error);
                return;
              }
              if (results.count) {
                dbConnection.release();
                console.log('Error: ChatId exists aleady.');
                return;
              }
              // Send received message to other player.
              if (Players[gameId]) {
                for (let i = 0; i < Players[gameId].length; ++i) {
                  if (connection !== Players[gameId][i]) {
                    'open' === Connections[Players[gameId][i]].state && Connections[Players[gameId][i]].sendUTF(JSON.stringify({
                      command: 'message',
                      message: message.message
                    }));
                    break;
                  }
                }
              }
              // Insert received message into database.
              db.query('INSERT INTO chats (id' + ('Black' === color ? 'Black' : 'White') + ', gameId, message) VALUE (?, ?, ?)', [message.ChatId, gameId, message.message], function (error, results, fields) {
                dbConnection.release();
                if (error) {
                  console.error(error);
                  return;
                }
              });
            });
          });
        // Move made.
        } else if ('move' === message.command) {
          if (('string' !== typeof message.Figure || 1 !== message.Figure.length || 0 > 'RNBQKPrnbqkp'.indexOf(message.Figure))
          || ('number' !== typeof message.NewId || 0 > message.NewId || 63 < message.NewId)
          || ('number' !== typeof message.OldId || 0 > message.OldId || 63 < message.OldId)
          || ('string' !== typeof message.positions || 64 !== message.positions.length)) {
            'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
              command: 'error',
              reason: 'Invalid keys.'
            }));
            return;
          }
          if (('Black' === Colors[connection] && 0 > 'RNBQKP'.indexOf(message.Figure))
          || ('White' === Colors[connection] && 0 > 'rnbqkp'.indexOf(message.Figure))) {
            'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
              command: 'error',
              reason: 'Invalid color.'
            }));
            return;
          }
          for (let i = 0; i < message.positions.length; ++i) {
            if (0 > 'RNBQKPrnbqkp '.indexOf(message.positions[i])) {
              'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                command: 'error',
                reason: 'Invalid positions key.'
              }));
              return;
            }
          }
          if ('undefined' === typeof GameIds[connection]) {
            'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
              command: 'error',
              reason: 'Game not found.'
            }));
            return;
          }
          let gameId = GameIds[connection];
          if ('undefined' !== typeof Viewers[gameId]) {
            db.getConnection(function(err, dbConnection) {
              if (err) {
                console.error('Error connecting: ' + err.stack);
                return;
              }
              // Get values for game.
              db.query('SELECT ended,moveId,castleBlackLeft,castleBlackRight,castleWhiteLeft,castleWhiteRight FROM games WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                if (error) {
                  dbConnection.release();
                  console.error(error);
                  return;
                }
                if (!results.length) {
                  dbConnection.release();
                  console.error(error);
                  return;
                }
                if (results[0].ended) {
                  dbConnection.release();
                  console.error('Error: Game already ended.');
                  return;
                }
                let moveId = results[0].moveId,
                    castleBlackLeft = results[0].castleBlackLeft,
                    castleBlackRight = results[0].castleBlackRight,
                    castleWhiteLeft = results[0].castleWhiteLeft,
                    castleWhiteRight = results[0].castleWhiteRight;
                // Get positions for game.
                db.query('SELECT positions FROM moves WHERE gameId = ? AND moveId = ? LIMIT 1', [gameId, moveId], function (error, results, fields) {
                  if (error) {
                    dbConnection.release();
                    console.error(error);
                    return;
                  }
                  if (!results.length) {
                    dbConnection.release();
                    console.error(error);
                    return;
                  }
                  let positionsOld = results[0].positions;
                  // Get history for game.
                  db.query('SELECT history FROM moves WHERE gameId = ? AND moveId = ? LIMIT 1', [gameId, moveId], function (error, results, fields) {
                    if (error) {
                      dbConnection.release();
                      console.error(error);
                      return;
                    }
                    let lastHistory = results.length ? results[0].history : '',
                        validation = ValidateMove(message, lastHistory, moveId, positionsOld, castleBlackLeft, castleBlackRight, castleWhiteLeft, castleWhiteRight);
                    // Discard move if found invalid.
                    if (!validation[0]) {
                      dbConnection.release();
                      return;
                    }
                    // Discard move if player status is checkmate.
                    if (Check('Black' === Colors[connection] ? 'q' : 'Q', message.NewId, message.OldId, message.positions)) {
                      dbConnection.release();
                      console.log('Invalid checkmate!');
                      return;
                    }
                    // Calculate checkmate status.
                    let checkMate = false;
                    if (Check(message.Figure, message.NewId, message.OldId, message.positions)) {
                      checkMate = true;
                      let newFigure = 'Black' === Colors[connection] ? 'bknpqr' : 'BKNPQR';
                      for (let i = 0; i < message.positions.length; ++i) {
                        if (0 <= newFigure.indexOf(message.positions[i])
                        && Marker(message.positions[i], i, lastHistory, message.positions)) {
                          checkMate = false;
                          break;
                        }
                      }
                    }
                    // Calculate remi status.
                    let remi = false;
                    if (!checkMate) {
                      remi = true;
                      let newFigure = 'Black' === Colors[connection] ? 'bknpqr' : 'BKNPQR';
                      for (let i = 0; i < message.positions.length; ++i) {
                        if (0 <= newFigure.indexOf(message.positions[i])
                        && Marker(message.positions[i], i, lastHistory, message.positions)) {
                          remi = false;
                          break;
                        }
                      }
                    }
                    // Increase moveId. If checkmate or remi add unix time to ended column.
                    db.query('UPDATE games SET' + (checkMate || remi ? ' ended = UNIX_TIMESTAMP(),' : '') + ' moveId = moveId + 1 WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                    //db.query('UPDATE games SET moveId = moveId + 1 WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                      if (error) {
                        dbConnection.release();
                        console.error(error);
                        return;
                      }
                      if (!results.changedRows) {
                        dbConnection.release();
                        console.error('Error: Game not found.');
                        return;
                      }
                      // Delete all database entries where moveId greater current moveId + 1;
                      db.query('DELETE FROM moves WHERE gameId = ? AND moveId >= ?', [gameId, moveId + 1], function (error, results, fields) {
                        if (error) {
                          dbConnection.release();
                          console.error(error);
                          return;
                        }
                        // Insert current move into database.
                        db.query('INSERT INTO moves (gameId, history, moveId, positions) VALUES (?, ?, ?, ?)', [gameId, message.Figure + message.OldId + '-' + message.NewId + validation[5], moveId + 1, message.positions], function (error, results, fields) {
                          if (error) {
                            console.error(error);
                            db.query('UPDATE games SET moveId = moveId - 1 WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                              dbConnection.release();
                              error && console.error(error);
                            });
                            return;
                          }
                          // Updata castle columns if their values have been changed.
                          if (castleBlackLeft !== validation[1]
                          || castleBlackRight !== validation[2]
                          || castleWhiteLeft !== validation[3]
                          || castleWhiteRight !== validation[4]) {
                            db.query('UPDATE games SET castleBlackLeft = ?, castleBlackRight = ?, castleWhiteLeft = ?, castleWhiteRight = ? WHERE id = ? LIMIT 1', [validation[1], validation[2], validation[3], validation[4], gameId], function (error, results, fields) {
                              dbConnection.release();
                              if (error) {
                                console.error(error);
                                return;
                              }
                              if (!results.changedRows) {
                                console.error('Error: Game not found.');
                                return;
                              }
                              SendMove(connection, gameId, message);
                            });
                          } else {
                            dbConnection.release();
                            SendMove(connection, gameId, message);
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          }
        // Player moved back.
        } else if ('moveBack' === message.command) {
          let gameId = GameIds[connection];
          if ('undefined' !== typeof Viewers[gameId]) {
            db.getConnection(function(err, dbConnection) {
              if (err) {
                console.error('Error connecting: ' + err.stack);
                return;
              }
              // Get ended and moveId from database.
              db.query('SELECT ended,moveId FROM games WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                if (error) {
                  dbConnection.release();
                  console.error(error);
                  return;
                }
                if (!results.length) {
                  dbConnection.release();
                  console.log('Error: Game not found.');
                  return;
                }
                if (results[0].ended) {
                  dbConnection.release();
                  console.log('Error: Game already ended.');
                  return;
                }
                // Get history from database.
                db.query('SELECT history FROM moves WHERE gameId = ? AND moveId = ? LIMIT 1', [gameId, results[0].moveId], function (error, results, fields) {
                  if (error) {
                    dbConnection.release();
                    console.error(error);
                    return;
                  }
                  if (!results.length) {
                    dbConnection.release();
                    console.log('Error: Move not found.');
                    return;
                  }
                  if (null === results[0].history) {
                    if ('Black' === Colors[connection]) {
                      dbConnection.release();
                      'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                        command: 'error',
                        reason: 'Wrong color.'
                      }));
                      return;
                    }
                  } else if (('Black' === Colors[connection] && 0 > 'RNBQKP'.indexOf(results[0].history[0]))
                  || ('White' === Colors[connection] && 0 > 'rnbqkp'.indexOf(results[0].history[0]))) {
                    dbConnection.release();
                    'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                      command: 'error',
                      reason: 'Wrong color.'
                    }));
                    return;
                  }
                  // Decrease moveId in database.
                  db.query('UPDATE games SET moveId = moveId - 1 WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                    dbConnection.release();
                    if (error) {
                      console.error(error);
                      return;
                    }
                    if (!results.changedRows) {
                      dbConnection.release();
                      console.error('Error: Game not found.');
                      return;
                    }
                    // Send move back to all viewers.
                    for (let i = 0; i < Viewers[gameId].length; ++i) {
                      if (connection !== Viewers[gameId][i]) {
                        'open' === Connections[Viewers[gameId][i]].state && Connections[Viewers[gameId][i]].sendUTF(JSON.stringify({
                          command: 'moveBack'
                        }));
                      }
                    }
                  });
                });
              });
            });
          }
        // Player moved forward.
        } else if ('moveForward' === message.command) {
          let gameId = GameIds[connection];
          if ('undefined' !== typeof Viewers[gameId]) {
            db.getConnection(function(err, dbConnection) {
              if (err) {
                console.error('Error connecting: ' + err.stack);
                return;
              }
              // Get ended and moveId from database.
              db.query('SELECT ended,moveId FROM games WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                if (error) {
                  dbConnection.release();
                  console.error(error);
                  return;
                }
                if (!results.length) {
                  dbConnection.release();
                  console.log('Error: Game not found.');
                  return;
                }
                if (results[0].ended) {
                  dbConnection.release();
                  console.log('Error: Game already ended.');
                  return;
                }
                // Get history from database.
                db.query('SELECT history FROM moves WHERE gameId = ? AND moveId = ? LIMIT 1', [gameId, results[0].moveId], function (error, results, fields) {
                  if (error) {
                    dbConnection.release();
                    console.error(error);
                    return;
                  }
                  if (!results.length) {
                    dbConnection.release();
                    console.log('Error: Move not found.');
                    return;
                  }
                  if (null === results[0].history) {
                    if ('Black' === Colors[connection]) {
                      dbConnection.release();
                      'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                        command: 'error',
                        reason: 'Wrong color.'
                      }));
                      return;
                    }
                  } else if (('Black' === Colors[connection] && 0 > 'rnbqkp'.indexOf(results[0].history[0]))
                  || ('White' === Colors[connection] && 0 > 'RNBQKP'.indexOf(results[0].history[0]))) {
                    dbConnection.release();
                    'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                      command: 'error',
                      reason: 'Wrong color.'
                    }));
                    return;
                  }
                  // Increase moveId in database.
                  db.query('UPDATE games SET moveId = moveId + 1 WHERE id = ? LIMIT 1', [gameId], function (error, results, fields) {
                    dbConnection.release();
                    if (error) {
                      console.error(error);
                      return;
                    }
                    if (!results.changedRows) {
                      dbConnection.release();
                      console.error('Error: Game not found.');
                      return;
                    }
                    // Send move forward to all viewers.
                    for (let i = 0; i < Viewers[gameId].length; ++i) {
                      if (connection !== Viewers[gameId][i]) {
                        'open' === Connections[Viewers[gameId][i]].state && Connections[Viewers[gameId][i]].sendUTF(JSON.stringify({
                          command: 'moveForward'
                        }));
                      }
                    }
                  });
                });
              });
            });
          }
        // Player wants to start a new game.
        } else if ('start' === message.command) {
          let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
              tokenBlack = '',
              tokenWhite = '';
          for (let i = 0; i < 30; ++i) {
            tokenBlack += characters[Math.round(Math.random() * (characters.length - 1))];
            tokenWhite += characters[Math.round(Math.random() * (characters.length - 1))];
          }
          db.getConnection(function(err, dbConnection) {
            if (err) {
              console.error('Error connecting: ' + err.stack);
              return;
            }
            // Insert new game in database.
            db.query('INSERT INTO games (tokenBlack, tokenWhite) VALUES ("' + tokenBlack + '", "' + tokenWhite + '")', function (error, results, fields) {
              if (error) {
                dbConnection.release();
                console.error(error);
                return;
              }
              let gameId = results.insertId,
                  startPositions = 'RNBQKBNRPPPPPPPP                                pppppppprnbqkbnr';
              // Insert startpositions in database.
              db.query('INSERT INTO moves (gameId, positions) VALUES (' + gameId + ', "' + startPositions + '")', function (error, results, fields) {
                if (error) {
                  console.error(error);
                  db.query('DELETE FROM games WHERE id = ' + gameId, function (error, results, fields) {
                    dbConnection.release();
                    if (error) {
                      console.error(error);
                      return;
                    }
                  });
                  return;
                }
                dbConnection.release();
                let color = 'string' === typeof message.color && 'Black' === message.color ? 'Black' : 'White';
                Colors[connection] = color;
                GameIds[connection] = gameId;
                Viewers[gameId] = [connection];
                Players[gameId] = [connection];
                // Send player start values.
                'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                  ChatId: 0,
                  command: 'startPositions',
                  startPositions: startPositions,
                  token: 'Black' === color ? 'b' + gameId + tokenBlack : 'w' + gameId + tokenWhite,
                  tokenInvite: 'Black' === color ? 'w' + gameId + tokenWhite : 'b' + gameId + tokenBlack
                }));
              });
            });
          });
        // Player wants to join an existing game.
        } else if ('tokenInvite' === message.command) {
          if ('string' === typeof message.tokenInvite
          && ('b' === message.tokenInvite[0] || 'w' === message.tokenInvite[0])) {
            let gameId = parseInt(message.tokenInvite.substring(1));
            if (isNaN(gameId)
            || 1 > gameId) {
              'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                command: 'error',
                reason: 'Invalid token.'
              }));
              return;
            }
            db.getConnection(function(err, dbConnection) {
              if (err) {
                console.error('Error connecting: ' + err.stack);
                return;
              }
              // Get game values from database.
              db.query('SELECT moveId,castleBlackLeft,castleBlackRight,castleWhiteLeft,castleWhiteRight,token' + ('b' === message.tokenInvite[0] ? 'White' : 'Black') + ' AS tokenInvite FROM games WHERE id = ? AND token' + ('b' === message.tokenInvite[0] ? 'Black' : 'White') + ' = ? LIMIT 1', [gameId, message.tokenInvite.substring(1 + gameId.toString().length)], function (error, results, fields) {
                if (error) {
                  dbConnection.release();
                  console.error(error);
                  return;
                }
                if (!results.length) {
                  dbConnection.release();
                  'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                    command: 'error',
                    reason: 'Invalid token.'
                  }));
                  return;
                }
                let moveId = results[0].moveId,
                    castleBlackLeft = results[0].castleBlackLeft,
                    castleBlackRight = results[0].castleBlackRight,
                    castleWhiteLeft = results[0].castleWhiteLeft,
                    castleWhiteRight = results[0].castleWhiteRight,
                    tokenInvite = ('b' === message.tokenInvite[0] ? 'w' : 'b') + gameId + results[0].tokenInvite;
                // Get history and positions from database.
                db.query('SELECT history,positions FROM moves WHERE gameId = ? ORDER BY id ASC', [gameId], function (error, results, fields) {
                  if (error) {
                    dbConnection.release();
                    console.error(error);
                    return;
                  }
                  if (!results.length
                  || 'undefined' === typeof results[moveId]) {
                    dbConnection.release();
                    'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                      command: 'error',
                      reason: 'Moves not found.'
                    }));
                    return;
                  }
                  let History = [],
                      Places = [];
                  // Calculate history and places.
                  for (let i = 0; i < results.length; ++i) {
                    i && History.push(results[i].history);
                    Places.push(results[i].positions);
                  }
                  let color = 'b' === message.tokenInvite[0] ? 'Black' : 'White',
                      figure = results[moveId].history ? results[moveId].history[0] : '-';
                  if ('undefined' !== typeof Players[gameId]) {
                    // Kick old player if new player is of same color.
                    for (let i = 0; i < Players[gameId].length; ++i) {
                      if (color === Colors[Players[gameId][i]]) {
                        'open' === Connections[Players[gameId][i]].state && Connections[Players[gameId][i]].sendUTF(JSON.stringify({
                          command: 'kick'
                        }));
                        'open' === Connections[Players[gameId][i]].state && Connections[Players[gameId][i]].close();
                      }
                    }
                  }
                  Colors[connection] = color;
                  'undefined' === typeof Viewers[gameId] && (Viewers[gameId] = []);
                  GameIds[connection] = gameId;
                  Viewers[gameId].push(connection);
                  'undefined' === typeof Players[gameId] && (Players[gameId] = []);
                  Players[gameId].push(connection);
                  // Get chat messages from database.
                  db.query('SELECT created,idBlack,idWhite,message FROM chats WHERE gameId = ? ORDER BY id ASC', [gameId], function (error, results, fields) {
                    if (error) {
                      dbConnection.release();
                      console.error(error);
                      return;
                    }
                    let chat = [],
                        chatId = 0;
                    for (let i = 0; i < results.length; ++i) {
                      null !== results[i]['id' + color] && (chatId = results[i]['id' + color] + 1);
                      chat.push({color: null !== results[i].idBlack ? 'Black' : 'White', created: results[i].created, message: results[i].message});
                    }
                    // Send all variables to player.
                    if ('open' === Connections[connection].state) {
                      Connections[connection].sendUTF(JSON.stringify({
                        activePlayer : 0 > 'rnbqkp'.indexOf(figure) ? 'White' : 'Black',
                        chat: chat,
                        ChatId: chatId,
                        color: color,
                        command: 'join',
                        History: History,
                        moveId: moveId,
                        now: Math.round((new Date).getTime() / 1E3),
                        Places: Places,
                        castleBlackLeft: castleBlackLeft,
                        castleBlackRight: castleBlackRight,
                        castleWhiteLeft: castleWhiteLeft,
                        castleWhiteRight: castleWhiteRight,
                        token: message.tokenInvite,
                        tokenInvite: tokenInvite
                      }));
                      // Send new players network status to all viewers.
                      if (Viewers[gameId]) {
                        for (let i = 0; i < Viewers[gameId].length; ++i) {
                          if (connection !== Viewers[gameId][i]) {
                            'open' === Connections[Viewers[gameId][i]].state && Connections[Viewers[gameId][i]].sendUTF(JSON.stringify({
                              color: color,
                              command: 'partner',
                              status: 'online'
                            }));
                          }
                        }
                      }
                    }
                    // Send new players network status to other player.
                    if (Players[gameId]) {
                      let partnerStatus = 'offline';
                      for (let i = 0; i < Players[gameId].length; ++i) {
                        if (connection !== Players[gameId][i]) {
                          partnerStatus = 'open' === Connections[Players[gameId][i]].state ? 'online' : 'offline';
                          break;
                        }
                      }
                      'open' === Connections[connection].state && Connections[connection].sendUTF(JSON.stringify({
                        command: 'partner',
                        status: partnerStatus
                      }));
                      if (1 < Players[gameId].length) {
                        // Set game as started in database.
                        db.query('UPDATE games SET started = UNIX_TIMESTAMP() WHERE id = ? AND started IS NULL LIMIT 1', [gameId], function (error, results, fields) {
                          dbConnection.release();
                          error && console.error(error);
                        });
                      } else {
                        dbConnection.release();
                      }
                    }
                  });
                });
              });
            });
          }
        }
      });
      // Connection closed.
      Connections[connection].on('close', function(reasonCode, description) {
        console.log('Peer ' + Connections[connection].remoteAddress + ' disconnected.');
        Connections[connection] && delete Connections[connection];
        if (GameIds[connection]) {
          let gameId = GameIds[connection];
          if (Viewers[gameId]) {
            // Remove leaving player from viewers array.
            for (let i = 0; i < Viewers[gameId].length; ++i) {
              if (connection === Viewers[gameId][i]) {
                1 < Viewers[gameId].length ? Viewers[gameId] = Viewers[gameId].slice(0, i).concat(Viewers[gameId].slice(i + 1)) : delete Viewers[gameId];
                break;
              }
            }
            if (Viewers[gameId]
            && Colors[connection]) {
              // Send leaving players network status to all viewers.
              for (let i = 0; i < Viewers[gameId].length; ++i) {
                if (connection !== Viewers[gameId][i]) {
                  'open' === Connections[Viewers[gameId][i]].state && Connections[Viewers[gameId][i]].sendUTF(JSON.stringify({
                    color: Colors[connection],
                    command: 'partner',
                    status: 'offline'
                  }));
                }
              }
            }
          }
          if (Players[gameId]) {
            // Remove leaving player form players array.
            for (let i = 0; i < Players[gameId].length; ++i) {
              if (connection === Players[gameId][i]) {
                1 < Players[gameId].length ? Players[gameId] = Players[gameId].slice(0, i).concat(Players[gameId].slice(i + 1)) : delete Players[gameId];
                break;
              }
            }
          }
          GameIds[connection] && delete GameIds[connection];
        }
        Colors[connection] && delete Colors[connection];
      });
    });
  });
});