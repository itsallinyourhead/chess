<!doctype html>
<html lang="en">
    <meta charset="utf-8">
    <meta content="width=device-width,initial-scale=1" name="viewport">
    <title>Chess</title>
    <link href="data:image/x-icon;base64,AAABAAEAEBAAAAAAIACHAAAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAQAAAAEAgGAAAAH/P/YQAAAAFzUkdCAK7OHOkAAAAEZ0FNQQAAsY8L/GEFAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAHElEQVQ4T2P4z8DwnxI8asCoASA8asAwMIDhPwAwxP4QzCRukwAAAABJRU5ErkJggg==" rel="icon">
    <link href="/css/stylesheets.css" rel="stylesheet" type="text/css">
    <script src="/js/head.js"></script>
    <main>
        <div id="board">
            <div class="boardHorizontal">
                <div>
                    <span>a</span>
                </div>
                <div>
                    <span>b</span>
                </div>
                <div>
                    <span>c</span>
                </div>
                <div>
                    <span>d</span>
                </div>
                <div>
                    <span>e</span>
                </div>
                <div>
                    <span>f</span>
                </div>
                <div>
                    <span>g</span>
                </div>
                <div>
                    <span>h</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>8</span>
                </div>
                <div class="bright" data-id="0" id="field0"></div>
                <div class="dark" data-id="1" id="field1"></div>
                <div class="bright" data-id="2" id="field2"></div>
                <div class="dark" data-id="3" id="field3"></div>
                <div class="bright" data-id="4" id="field4"></div>
                <div class="dark" data-id="5" id="field5"></div>
                <div class="bright" data-id="6" id="field6"></div>
                <div class="dark" data-id="7" id="field7"></div>
                <div class="boardVertical">
                    <span>8</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>7</span>
                </div>
                <div class="dark" data-id="8" id="field8"></div>
                <div class="bright" data-id="9" id="field9"></div>
                <div class="dark" data-id="10" id="field10"></div>
                <div class="bright" data-id="11" id="field11"></div>
                <div class="dark" data-id="12" id="field12"></div>
                <div class="bright" data-id="13" id="field13"></div>
                <div class="dark" data-id="14" id="field14"></div>
                <div class="bright" data-id="15" id="field15"></div>
                <div class="boardVertical">
                    <span>7</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>6</span>
                </div>
                <div class="bright" data-id="16" id="field16"></div>
                <div class="dark" data-id="17" id="field17"></div>
                <div class="bright" data-id="18" id="field18"></div>
                <div class="dark" data-id="19" id="field19"></div>
                <div class="bright" data-id="20" id="field20"></div>
                <div class="dark" data-id="21" id="field21"></div>
                <div class="bright" data-id="22" id="field22"></div>
                <div class="dark" data-id="23" id="field23"></div>
                <div class="boardVertical">
                    <span>6</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>5</span>
                </div>
                <div class="dark" data-id="24" id="field24"></div>
                <div class="bright" data-id="25" id="field25"></div>
                <div class="dark" data-id="26" id="field26"></div>
                <div class="bright" data-id="27" id="field27"></div>
                <div class="dark" data-id="28" id="field28"></div>
                <div class="bright" data-id="29" id="field29"></div>
                <div class="dark" data-id="30" id="field30"></div>
                <div class="bright" data-id="31" id="field31"></div>
                <div class="boardVertical">
                    <span>5</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>4</span>
                </div>
                <div class="bright" data-id="32" id="field32"></div>
                <div class="dark" data-id="33" id="field33"></div>
                <div class="bright" data-id="34" id="field34"></div>
                <div class="dark" data-id="35" id="field35"></div>
                <div class="bright" data-id="36" id="field36"></div>
                <div class="dark" data-id="37" id="field37"></div>
                <div class="bright" data-id="38" id="field38"></div>
                <div class="dark" data-id="39" id="field39"></div>
                <div class="boardVertical">
                    <span>4</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>3</span>
                </div>
                <div class="dark" data-id="40" id="field40"></div>
                <div class="bright" data-id="41" id="field41"></div>
                <div class="dark" data-id="42" id="field42"></div>
                <div class="bright" data-id="43" id="field43"></div>
                <div class="dark" data-id="44" id="field44"></div>
                <div class="bright" data-id="45" id="field45"></div>
                <div class="dark" data-id="46" id="field46"></div>
                <div class="bright" data-id="47" id="field47"></div>
                <div class="boardVertical">
                    <span>3</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>2</span>
                </div>
                <div class="bright" data-id="48" id="field48"></div>
                <div class="dark" data-id="49" id="field49"></div>
                <div class="bright" data-id="50" id="field50"></div>
                <div class="dark" data-id="51" id="field51"></div>
                <div class="bright" data-id="52" id="field52"></div>
                <div class="dark" data-id="53" id="field53"></div>
                <div class="bright" data-id="54" id="field54"></div>
                <div class="dark" data-id="55" id="field55"></div>
                <div class="boardVertical">
                    <span>2</span>
                </div>
            </div>
            <div class="boardRow">
                <div class="boardVertical">
                    <span>1</span>
                </div>
                <div class="dark" data-id="56" id="field56"></div>
                <div class="bright" data-id="57" id="field57"></div>
                <div class="dark" data-id="58" id="field58"></div>
                <div class="bright" data-id="59" id="field59"></div>
                <div class="dark" data-id="60" id="field60"></div>
                <div class="bright" data-id="61" id="field61"></div>
                <div class="dark" data-id="62" id="field62"></div>
                <div class="bright" data-id="63" id="field63"></div>
                <div class="boardVertical">
                    <span>1</span>
                </div>
            </div>
            <div class="boardHorizontal">
                <div>
                    <span>a</span>
                </div>
                <div>
                    <span>b</span>
                </div>
                <div>
                    <span>c</span>
                </div>
                <div>
                    <span>d</span>
                </div>
                <div>
                    <span>e</span>
                </div>
                <div>
                    <span>f</span>
                </div>
                <div>
                    <span>g</span>
                </div>
                <div>
                    <span>h</span>
                </div>
            </div>
        </div>
        <div <?= $hideChooseOuter ? 'class="none" ' : '' ?>id="chooseOuter">
            <div class="floatOuter">
                <div id="chooseColorOuter">
                    <div>
                        <b>Color</b><br>
                        <label>
                            <input id="chooseColorBlack" name="chooseColor" type="radio" value="black">
                            <span>Black</span>
                        </label><br>
                        <label>
                            <input checked="checked" id="chooseColorWhite" name="chooseColor" type="radio" value="white">
                            <span>White</span>
                        </label>
                    </div>
                </div>
                <div id="chooseModeOuter">
                    <div>
                        <b>Mode</b><br>
                        <label>
                            <input id="chooseModeOffline" name="chooseMode" type="radio" value="offline">
                            <span>Offline</span>
                        </label><br>
                        <label>
                            <input checked="checked" id="chooseModeOnline" name="chooseMode" type="radio" value="online">
                            <span>Online</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="hidden spinner" id="startGameWaiting"></div>
            <span class="hidden" id="startGameWarning">You will leave the current game if you start a new game.</span>
            <input data-value="Start Game" id="startGame" type="button" value="Start Game">
        </div>
        <div class="none" id="invitationLinkOuter">
          <span>To invite another player share this link:</span>
          <br><br>
          <input disabled id="invitationLink" type="text" value=""><input data-value="Copy Invitation Link" type="button" id="invitationLinkCopy" value="Copy Invitation Link">
        </div>
    </main>
    <aside>
        <input class="overlayVisibility" id="overlayDisplay" type="checkbox">
        <label class="overlayLabel" for="overlayDisplay" id="overlayLabel" tabindex="1">Settings</label>
        <div class="overlay">
            <label class="overlayTitle">Settings</label>
            <input class="overlayCloseInput" id="overlayCloseInput" type="radio">
            <label class="overlayClose" for="overlayDisplay"></label>
            <div class="overlayInner">
                <div class="settingsOptionsOuter">
                    <label>Color</label><br>
                    <div class="settingsInputOuter">
                        <input class="settingsBoardColor settingsInput" data-color="1" id="settingsBoardColor1" name="settingsBoardColor" type="radio">
                    </div>
                    <div class="settingsInputOuter">
                        <input class="settingsBoardColor settingsInput" data-color="2" id="settingsBoardColor2" name="settingsBoardColor" type="radio">
                    </div>
                    <div class="settingsInputOuter">
                        <input class="settingsBoardColor settingsInput" data-color="3" id="settingsBoardColor3" name="settingsBoardColor" type="radio">
                    </div>
                    <div class="settingsInputOuter">
                        <input class="settingsBoardColor settingsInput" data-color="4" id="settingsBoardColor4" name="settingsBoardColor" type="radio">
                    </div>
                </div>
                <div class="settingsOptionsOuter">
                    <label>Position</label><br>
                    <div class="settingsInputOuter">
                        <input class="settingsInput settingsPosition" data-deg="0" id="settingsPosition1" name="settingsPosition" type="radio">
                    </div>
                    <div class="settingsInputOuter">
                        <input class="settingsInput settingsPosition" data-deg="90" id="settingsPosition2" name="settingsPosition" type="radio">
                    </div>
                    <div class="settingsInputOuter">
                        <input class="settingsInput settingsPosition" data-deg="180" id="settingsPosition3" name="settingsPosition" type="radio">
                    </div>
                    <div class="settingsInputOuter">
                        <input class="settingsInput settingsPosition" data-deg="270" id="settingsPosition4" name="settingsPosition" type="radio">
                    </div>
                </div>
                <div id="overlayMiscellaneousOuter">
                    <label>Miscellaneous</label><br>
                    <label class="settingsMiscellaneous">
                        <div class="switchOuter"><input checked class="switchInput" id="settingsPossibleFields" type="checkbox"><div class="switchInner"><span class="switchOn">On</span><span class="switchMiddle">&nbsp;</span><span class="switchOff">Off</span></div></div>
                        <span>Mark possible fields to go to</span>
                    </label>
                    <label class="settingsMiscellaneous" id="settingsStartGameOuter">
                        <div class="switchOuter"><input <?= $hideChooseOuter ? '' : 'checked ' ?>class="switchInput" id="settingsStartGame" type="checkbox"><div class="switchInner"><span class="switchOn">On</span><span class="switchMiddle">&nbsp;</span><span class="switchOff">Off</span></div></div>
                        <span>Show Start Game Button</span>
                    </label>
                    <label class="none settingsMiscellaneous" id="settingsInvitationLinkOuter">
                        <div class="switchOuter"><input class="switchInput" id="settingsInvitationLink" type="checkbox"><div class="switchInner"><span class="switchOn">On</span><span class="switchMiddle">&nbsp;</span><span class="switchOff">Off</span></div></div>
                        <span>Show Invitation Link</span>
                    </label>
                </div>
            </div>
        </div>
        <label class="overlayBackground" for="overlayDisplay" id="overlayBackground"></label>
        <div class="none" id="asideChat">
            <span id="chatTitle">Chat</span>
            <div id="asideMessagesOld"></div>
            <textarea id="asideMessageNew" maxlength="1024" placeholder="Enter message" rows="1" tabindex="2"></textarea>
        </div>
        <div class="asideBackground none" id="asidePartner"></div>
        <div id="asideNav">
            <button class="hidden" id="asideNavLeft" tabindex="3" title="move back">&lt;</button><!--
            --><button class="hidden" id="asideNavRight" tabindex="4" title="move forward">&gt;</button>
        </div>
        <div class="asideBackground none" id="asideStatus"></div>
        <div class="asideBackground none" id="asideCheck"></div>
        <div class="asideBackground none" id="asideChoose"></div>
        <div class="asideBackground none" id="asideMessage"></div>
    </aside>
<?= isset($IPURL) ? '    <p hidden id="IPURL">' . $IPURL . '</p>' : '' ?>
<?= isset($token) ? '    <p hidden id="tokenWS">' . $token . '</p>' : '' ?>
    <script defer src="/js/body.js"></script>
</html>