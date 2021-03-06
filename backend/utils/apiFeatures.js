class APIFeatures {
    constructor(query, queryStr){
        this.query = query
        this.queryStr = queryStr
    }    

    //utilizado para buscar por nombre. En getAllProducts return products which contain keyword
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
        
        //Remove fields from the query
        const removeFields = ['keyword', 'limit', 'page']
        removeFields.forEach(el => delete queryCopy[el])


        // Advanced filter for price, ratings, etc...
        let queryStr = JSON.stringify(queryCopy)
        queryStr  = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`) 
        //le pone el & despues del $gte y lte para hacer la peticicion a mongo(te da el producto que está entre dos precios)

        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }

    pagination(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1
        const skip = resPerPage * (currentPage - 1)

        this.query = this.query.limit(resPerPage).skip(skip)
        
        return this
    }

   
}


module.exports = APIFeatures