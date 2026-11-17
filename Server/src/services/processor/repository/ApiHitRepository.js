export class ApiHitRepository extends BaseRepository{
    constructor({model, logger:l }={}){
       super({logger:l})
       if(!model){
        throw new Error("ApiHitRepository requires a model");
       }
       this.model=model;
    }
    async save (eventData){
        try{
         const doc= new this.model(eventData);
         await doc.save();
        }
       catch(error){
        if(error && error.code===11000){
             this.logger.warn("Duplicate event detected, skipping save",{eventId:eventData.eventId})
             return null;
        }
        this.logger.error("Failed to save api hit event to MongoDB",error);
        throw error;
       }
    }
    async find(filter={},options={}){
        try{
            const{limit=100,skip=0,sort={timestamp:-1}}=options;
            const hits=await this.model.find(filter).sort(sort).limit(limit).skip(skip).lean();
            return hits;
        }
        catch(error){
            this.logger.error("Failed to find api hit events in MongoDB",error);
            throw error;
        }
    }
    async count(filters={})
    {
        try{
            const count=await this.model.countDocuments(filters);
            return count;
        }
        catch(error){
            this.logger.error("Failed to count api hit events in MongoDB",error);
            throw error;
        }
    }
    async deleteOldHits(beforeDate){
        try{
            const result=await this.model.deleteMany({timestamp:{$lt:beforeDate}});
            this.logger.info(`Deleted old api hits:`,{count:result.deletedCounts});
            return result.deletedCount;

        }
        catch(error){
            this.logger.error("Failed to delete old api hit events in mongoDb",error);
            throw error;
        }
    }

}