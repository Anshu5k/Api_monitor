export class ProcessorService{
    constructor({apiHitRepository,metricsRepository}) {
        if(!apiHitRepository ||!metricsRepository){
            throw new Error("ProcessorService requires both apiHitRepository and metricsRepository");
        }
        this.apiHitRepository = apiHitRepository;
        this.metricsRepository = metricsRepository;
    }

    getTimeBucket(timestamp,interval='hour'){
        const date=new Date(timestamp);
        switch(interval){
            case 'hour':
                date.setMinutes(0,0,0);
                break;
            case 'day':
                date.setHours(0,0,0,0);
                break;
            case 'minute':
                date.setSeconds(0,0);
                break;
            default:
                date.setMinutes(0,0,0);

        }
        return date;
    }
    async processEvent(eventData){
        let rawEventSaved=false;
        try{
            logger.info("Processing event data:",{
                eventId:eventData.eventId,
                clientId:eventData.clientId,
                serviceName:eventData.serviceName,
                endPoint:eventData.endpoint,
                method:eventData.method,
            });
            await this.apiHitRepository.save(eventData)
            rawEventSaved=true;
            logger.info('Raw event saved to MongoDB',{
                eventId:eventData.eventId,
            })
            await this._updateMetricsWithFallBack(eventData);
            logger.info('Event processed successfully',{
                eventId:eventData.eventId,
            });

        }
        catch(error)
        {
            if(!rawEventSaved){
                logger.error('Critical: Failed to save raw event to MongoDB',{
                    error:error.message,
                    eventId:eventData.eventId,
                });
                throw error;
            }
            logger.error('non-Critical: Raw event saved but failed to update metrics',{
                error:error.message,
                eventId:eventData.eventId,
            });
        }
    }
    async _updateMetricsWithFallBack(eventData){
        try{
             //calc. time bucket
             const timeBucket=this.getTimeBucket(eventData.timestamp,'hour');
             //data prepare krenge
             const metricsData={
                clientId:eventData,clientId,
                serviceName:eventData.serviceName,
                endpoint:eventData.endpoint,
                method:eventData.method,
                totalHits:1,
                errorHits:eventData.statusCode>=400?1:0,
                avgLatency:eventData.LatencyMs,
                minLatency:eventData.latency.latencyMs,
                maxLatency:eventData.latency.latencyMs,
                timeBucket,
             };
             await this.metricsRepository.upsertEndPointsMetrics(metricsData);
             logger.info('Metrics updated successfully',
                {eventId:eventData.eventId}
            );
        }
        catch(error){
            throw error;
        }
    }
    async cleanupOldEvents(daysToKeep=30)
    {
        try{
            let cutoffDate=new Date();
            cutoffDate.setDate(cutoffDate.getDate()-daysToKeep);
            const deletedCount=await this.apiHitRepository.deleteOldEvents(cutoffDate);
            return deletedCount;
        } catch(error){
            logger.error('Failed to cleanup old events'
            );
            throw error;
        }
    }


}