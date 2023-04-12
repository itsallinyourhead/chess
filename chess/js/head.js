// Remove stylesheets made obsolete by newer stylesheets.
function RemoveObsoleteStyles(name, fromEnd) {
  'undefined' === typeof fromEnd && (fromEnd = 2);
  for (let style = document.head.getElementsByTagName('style'), i = style.length - fromEnd; 0 <= i; --i) {
    style[i].classList.contains(name) && style[i].parentNode.removeChild(style[i]);
  }
}
// Change color scheme of board.
function BoardColor(color) {
  'number' !== typeof color && (color = parseInt(this.getAttribute('data-color')));
  let bright, dark, elem = document.createElement('style'),
      pos1Left, pos1Top, pos2Left, pos2Top, pos3Left, pos3Top, pos4Left, pos4Top;
  if (2 === color) {
    bright = '#eaf0ce';
    dark = '#bbbe64';
    pos1Left = pos2Left = pos3Left = pos4Left = '225px';
    pos1Top = '300px';
    pos2Top = '225px';
    pos3Top = '150px';
    pos4Top = '75px';
  } else if (3 === color) {
    bright = '#fc0';
    dark = '#c30';
    pos1Left = pos2Left = pos3Left = pos4Left = '150px';
    pos1Top = '300px';
    pos2Top = '225px';
    pos3Top = '150px';
    pos4Top = '75px';
  } else if (4 === color) {
    bright = '#fff';
    dark = '#000';
    pos1Left = pos2Left = pos3Left = pos4Left = '75px';
    pos1Top = '300px';
    pos2Top = '225px';
    pos3Top = '150px';
    pos4Top = '75px';
  } else {
    bright = '#e3c16f';
    dark = '#b88b4a';
    pos1Left = pos2Left = pos3Left = pos4Left = '0';
    pos1Top = '300px';
    pos2Top = '225px';
    pos3Top = '150px';
    pos4Top = '75px';
  }
  elem.classList.add('BoardColor');
  document.head.appendChild(elem);
  let styleSheet = elem.sheet;
  styleSheet.insertRule(
    '#board {'
      +'background-color: ' + dark + ';'
    +'}',
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    '#board {'
      +'color: ' + bright + ';'
    +'}',
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    '.bright {'
      +'background-color: ' + bright + ';'
    +'}',
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    '#settingsPosition1 {'
      +'background-position: ' + pos1Left + ' ' + pos1Top +';'
    +'}',
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    '#settingsPosition2 {'
      +'background-position: ' + pos2Left + ' ' + pos2Top +';'
    +'}',
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    '#settingsPosition3 {'
      +'background-position: ' + pos3Left + ' ' + pos3Top +';'
    +'}',
    styleSheet.cssRules.length
  );
  styleSheet.insertRule(
    '#settingsPosition4 {'
      +'background-position: ' + pos4Left + ' ' + pos4Top +';'
    +'}',
    styleSheet.cssRules.length
  );
  RemoveObsoleteStyles('BoardColor');
  1 < color ? localStorage.setItem('boardColor', color) : localStorage.removeItem('boardColor');
}
// Use saved color scheme in local storage if any or use standard color scheme. Apply it at page load before the board is shown.
if ('string' === typeof localStorage.getItem('boardColor')
&& !isNaN(parseInt(value = localStorage.getItem('boardColor')))) {
  BoardColor(parseInt(value));
} else {
  BoardColor(1);
}
// Change degree of board.
function BoardDegree(deg) {
  'number' !== typeof deg && (deg = parseInt(this.getAttribute('data-deg')));
  if (deg) {
    let elem = document.createElement('style');
    elem.classList.add('BoardDegree');
    document.head.appendChild(elem);
    let styleSheet = elem.sheet;
    styleSheet.insertRule(
      '#board {'
        +'transform: rotate(' + deg + 'deg);'
      +'}',
      styleSheet.cssRules.length
    );
    styleSheet.insertRule(
      '.boardHorizontal > div > span,'
      +'.boardVertical > span,'
      +'.bright,'
      +'.dark {'
        +'transform: rotate(' + (360 - deg) + 'deg);'
      +'}',
      styleSheet.cssRules.length
    );
    RemoveObsoleteStyles('BoardDegree');
    localStorage.setItem('boardDegree', deg);
  } else {
    RemoveObsoleteStyles('BoardDegree', 1);
    localStorage.removeItem('boardDegree');
  }
}
// Use saved degree in local storage if any or use standard degree. Apply it at page load before the board is shown.
if ('string' === typeof localStorage.getItem('boardDegree')
&& !isNaN(parseInt(value = localStorage.getItem('boardDegree')))) {
  BoardDegree(parseInt(value));
}