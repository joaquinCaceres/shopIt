class APIFeatures {
    constructor(query, queryStr){
        this.query = query
        this.queryStr = queryStr
    }    

    search(){
        const keyword = this.queryStr.keyword ? { 

            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({ ...keyword })
        return this
    }

    filter(){
        const queryCopy = { ...this.queryStr }

        console.log(queryCopy)
        
        //Remove fields from the query
        const removeFields = ['keyword', 'limit', 'page ']
        removeFields.forEach(el => delete queryCopy[el])

        console.log(queryCopy)


        // Advanced filter for price, ratings, etc...
        let queryStr = JSON.stringify(queryCopy)
        queryStr  = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`) 
        //le pone el & despues del $gte y lte para hacer la peticicion a mongo(te da el producto que está entre dos precios)

        console.log(queryCopy)

        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }

   
}


module.exports = APIFeatures