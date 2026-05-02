export class Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly completed: boolean,
    public readonly createdAt: Date,
  ) {}
}
