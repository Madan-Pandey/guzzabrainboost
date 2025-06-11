import prisma from "@/lib/prisma"
type fetchRankType = { 
   
    playerpoint : number
}


const fetchRank = async( playerpoint: number)=> { 
const rank = await prisma.player.count({ 
where : { 
    Playerpoint : { gt:playerpoint}
}

}) +1
return rank


}
export default fetchRank