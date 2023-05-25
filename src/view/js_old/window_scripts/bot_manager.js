let botManagerBotListTemplate = `
<td>
  <label>%bot_name%</label>
</td>
<td>
  <button onclick="editBot('%bot_name%')">Edit</button>
</td>
<td>
  <button data-visibleWhenBotNotStarted="%bot_name%" class="success" onclick="startBot('%bot_name%')">Start</button>
  <button data-visibleWhenBotStarted="%bot_name%" class="danger" onclick="stopBot('%bot_name%')">Stop</button>
</td>
`;

function reloadBotManagerWindow(botList) {
  // Clear current list
  document.getElementById("bot_manager-bot_list").innerHTML = "";

  const botListTable = document.createElement('table');

  for (let i in botList) {
    let botComponent = document.createElement("tr");
    botComponent.innerHTML = botManagerBotListTemplate
      .replace(/%bot_name%/g, botList[i]);
    botListTable.appendChild(botComponent);
  }

  document.getElementById("bot_manager-bot_list").appendChild(botListTable);
}
