interface SimpleBotData {
  name: string;
  token: string;
}

interface BotData {
  name: string;
  token: string;
  prefix: string;
  commands: Dictionary<Command>;
}
