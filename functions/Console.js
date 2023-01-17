export class Console {
  constructor(title, availability, link) {
    this.title = title;
    this.availability = availability;
    this.link = link;
  }
  toString() {
    const status =
      this.availability === "Add to Cart" ? "Available" : this.availability;
    return `${this.title} is ${status.toUpperCase()} at ${this.link}`;
  }
}
