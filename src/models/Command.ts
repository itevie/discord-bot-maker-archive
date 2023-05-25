export default class Command {
  name: string;
  type: string;

  constructor(data: CommandData) {
    this.name = data.name;
    this.type = data.type;
  }
}
