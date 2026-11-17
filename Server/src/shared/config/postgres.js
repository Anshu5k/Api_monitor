import config from './index.js';
import pg from 'pg'
import logger from './logger.js';

const {Pool}=pg;

class  postgresConnection{
    constructor ()
    {
        this.pool=null;
    }
    getPool(){
        if(!this.pool)
        {
            this.pool=new Pool({
                host:config.postgres.host,
                port:config.postgres.port,
                database:config.postgres.database,
                user:config.postgres.user,
                password:config.postgres.password,
                max:20,
                idleTimeoutMillis:30000,
                connectionTimeoutMillis:2000,
            })
            this.pool.on('error',(err)=>{
                logger.error("unexpected error in pg client",err)
            })
            logger.info("pg pool created")
            return this.pool;
        }
    }
    async testConnection()
    {
        try{
            const pool=this.getPool();
            const client=await pool.connect();
            const result=await client.query("SELECT NOW()");
            client.release();
            logger.info(`Pg connected successfully at ${result.rows[0].now}`)


        }
        catch(err){
              logger.error("faild to connect Pg",err)
            throw err;
        }
    }
    async query(text,params)
    {
        const pool=this.getPool();
        const start=Date.now();
        try{
            const result=await pool.query(text,params);
            const duration=Date.now()-start;
            logger.debug('executed query',{text,duration,rows:result.rowCount});
            return result;
        }
        catch(err){
            logger.error("query error",{text,error:err.message})
            throw err;
        }


    }
    async close()
    {
        if(this.pool)
        {
            await this.pool.end();
            this.pool=null;
            logger.info("Pg pool closed");

        }

    }

}
 export default new postgresConnection();