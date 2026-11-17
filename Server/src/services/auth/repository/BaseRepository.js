export default class BaseRepository{
    constructor(model)
    {
        this.model=model;
    }
    async create(data)
    {
        throw new error("Method not implemented");
    }
    
    async findById(data)
    {
        throw new error("Method not implemented");
    }
    async findByUserName(data)
    {
       throw new error("Method not implemented");
    }
    async findByEmail(data)
    {
        throw new error("Method not implemented");
    }
    async findAll()
    {
        throw new error("Method not implemented");
    }
}