import amqp from 'amqplib'
import logger from './logger.js'
import config from './index.js'

class RabbitMqConnection
{
   constructor()
   {
    this.connection=null;
    this.channel=null;
    this.isConnecting=false;
   }
   async connect()
   {
      if(this.channel)
      {
        return this.channel;
      }
      if(this.isConnecting)
      {
         await new Promise((resolve)=>{
            const checkInterval=setInterval(()=>{
               if(!this.isConnecting)
               {
                  clearInterval(checkInterval)
                  resolve()
               }
            },100)
         })
      }
      try{
         this.isConnecting=true;
         logger.info("Connecting to RabbitMq",config.rabbitmq.url)
         this.connection=await amqp.connect(config.rabbitmq.url)
         this.channel=await this.connection.createChannel();
         //dlqName is both name for queue as well as routing key
         const dlqName=`${config.rabbitmq.queue}.dlq`
         await this.channel.assertQueue(dlqName,{durable:true})//api_hits.dlq
         //this is the normal queue joint with dlq using routing key
         await this.channel.assertQueue(config.rabbitmq.queue,{
            durable:true,
            arguments:{
               "x-dead-letter-exchange":"",
               "x-dead-letter-routingkey":dlqName
            }
         })
         logger.info("RabbitMQ connected, queue",config.rabbitmq.queue)
         this.connection.on("close",()=>{
            logger.warn("RabbirtMQ connection closed");
            this.connection=null;
            this.channel=null;
         })
         this.connection.on("error",(err)=>{
            logger.error("RabbirtMQ connection closed",err);
            this.connection=null;
            this.channel=null;
         })

         this.isConnecting=false;
         return this.channel;
         

      }
      catch(err)
      {
          this.connecting=false;
          logger.error("false to connect RabbitMQ",err);
          return err;
      }
   }
   getChannel()
   {
      return this.channel;
   }
   getStatus()
   {
      if(!this.channel||!this.connect)return "disconnected";
      if(this.connect.closing)return "Closing";
      return "Connected";
   }
   async close(){
      try{
         if(this.channel)
         {
            await this.channel.close();
            this.channel=null;
         }
         if(this.connection)
         {
            await this.connection.close();
            this.connection=null;
         }
         logger.info("rabbitMQ connection closed")

      }
      catch(err)
      {
         logger.error("error in closing RabbitMQ connection",err)
      }
      
   }
}
export default new RabbitMqConnection();
