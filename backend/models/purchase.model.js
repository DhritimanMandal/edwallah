import mongooose from 'mongoose'

const purchaseSchema = new mongooose.Schema ({
    userId:{
        type: mongooose.Types.ObjectId,
        ref:"User"
    },
    courseId:{
        type: mongooose.Types.ObjectId,
        ref:"Course"
    }
})

export const Purchase = mongooose.model("Purchase", purchaseSchema)