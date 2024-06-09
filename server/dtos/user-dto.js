module.exports = class UserDto {
    email;
    id;
    constructor(models) {
        this.email = models.email;
        this.id = models.id;
    }
}
