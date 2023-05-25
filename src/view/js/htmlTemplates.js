const htmlTemlates = {
  botManagerBotListItem: `
<td>
  <label>%bot_name%</label>
</td>
<td>
  <button onclick="botManager.editBot('%bot_name%')">Edit</button>
</td>
<td>
  <button data-visibleWhenBotNotStarted="%bot_name%" class="success" onclick="botManager.startBot('%bot_name%')">Start</button>
  <button data-visibleWhenBotStarted="%bot_name%" class="danger" onclick="botManager.stopBot('%bot_name%')">Stop</button>
</td>`,
};
