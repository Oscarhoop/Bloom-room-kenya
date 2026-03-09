import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

// 1. Initialize Database Connection
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("❌ Missing connection string in .env")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding Bloom Room database with Instagram data...')

  // 2. Clear existing data in the CORRECT relational order
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({}) 
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})

  // 3. Create the main category
  const mainCategory = await prisma.category.create({
    data: {
      name: 'Instagram Collection',
      slug: 'instagram-collection',
      description: 'Our latest beautiful arrangements straight from the feed.',
    },
  })

  // 4. Raw Instagram Data
  const rawProducts = [
    { name: "Thoughtfully Curated Bouquet", description: "A thoughtfully curated bouquet suitable for all occasions.", price: 5500, imageUrl: "https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/648296408_17913282249324923_3178737495059333611_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QEq4uQoySuwv-cEuiI9vR_OwQwBqxLkf_l7Eh20hI8MpER5ko_XlKzG-w5yAHxT7D0&_nc_ohc=6kyCvA5WEA0Q7kNvwHrCNaC&_nc_gid=I0e64_5gejs_q_IMvxs-0w&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfxDt0GMPOx0T13PWT7Plj3tj7spUNXpRvWSat0EWT58Q&oe=69B4D0F3&_nc_sid=10d13b" },
    { name: "My Heart Classic Bouquet", description: "The ‘my heart’ classic!", price: 2500, imageUrl: "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/649224205_17913613431324923_774987769334187588_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QE7hsvtSGxy_9jJYxMF9AR-hHf_BeV4LYu44t_hBLoODFnA6Ni9FGhRaWRHxv3WAzw&_nc_ohc=1Jbt8qxRdx8Q7kNvwE3SOje&_nc_gid=XjeF2kOIINOQyaI2XssHDw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfyjeHT8pUtE6P4RnScEy287oLdxAzctN_bNae6dTvdGlw&oe=69B4DFCA&_nc_sid=10d13b" },
    { name: "Thoughtful Celebration Bouquet", description: "A thoughtful bouquet to celebrate your loved ones big day.", price: 3000, imageUrl: "https://scontent-atl3-3.cdninstagram.com/v/t51.82787-15/648625973_17913281745324923_6406548536290186273_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGEkouU7WYyrRQcQ5luJuVWHLDSrCZqXgRkl1BAdX6086HH7geEbJB3sIsq5O8SYdA&_nc_ohc=1CSqaspLK1IQ7kNvwFqfoJa&_nc_gid=pCnmFoJP9hLGwxd6Epw-gQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfwdK0TBSaJNu10vh-cuinNe7xRZmrW_xtB6I6A2-H9_Ww&oe=69B4B14B&_nc_sid=10d13b" },
    { name: "Floral Charm Bouquet", description: "Floral charm.", price: 5500, imageUrl: "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-15/645969141_17913282831324923_7440226672766676720_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QFFbdXTc5D37LEsLGPYYdYOJlWa8izROMYMHZ8Bfxmpo2hUMo1rgHVchUV2oUmNllA&_nc_ohc=X9lFodOehRQQ7kNvwFrmGJE&_nc_gid=5IUrAH8F_rxZKPmIPpyP8A&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfzzMtFE01erQ05s6eb-UhS8bd3MAeiVcQlbYtd9hW6oUA&oe=69B4CF35&_nc_sid=10d13b" },
    { name: "Citrus Vibes Bouquet", description: "Serving citrus vibes with the new phone.", price: 0, imageUrl: "https://scontent-ord5-2.cdninstagram.com/v/t51.82787-15/649227748_18341965618213946_5153665474903948938_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QFj-gzCi9v3CaUG8paKg4-1Xj-FbzD5PPaLz-ePMBs6i15C7RGbzDJjnEcUhOdThHs&_nc_ohc=-0SI1ptRkM8Q7kNvwG0xdMa&_nc_gid=B26H6HNHWYbnsnp6IcUJvQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfwDrtNOF0Uq69Fn14Wvh5WzZ7Hp6R6QXP7ipqScf14O1Q&oe=69B4D3CC&_nc_sid=10d13b" },
    { name: "Happy Women's Day Message", description: "Happy womens day!", price: 0, imageUrl: "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-15/649232141_17913612015324923_3092482529737830816_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QHocSVQdK4Wcou3LVNxjljIbrRtXJklKIe6bVSBKJy6DrrUF4KaUIwdauzwhzSGhS8&_nc_ohc=srnvNfQa6roQ7kNvwGkBaN6&_nc_gid=QF_G8fMwqU9K8nL0ch_LBg&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfwE1K4vEXjTwcxV5nqyLBhhKyv0c-yW2GV6upcHQ5masw&oe=69B4BA1B&_nc_sid=10d13b" },
    { name: "International Women's Day Greeting", description: "Happy international womens day to all women, you make the world a better place!", price: 0, imageUrl: "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/645048888_17913610959324923_6353298089464405545_n.jpg?stp=dst-jpg_e35_s1080x1080_sh0.08_tt6&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGzhW_tbWwDO2N5U_FZ1SqN2rOkSvJrwL4wjWLuiMmSkdA5k-M7gXA2vdh0H-Rrtgk&_nc_ohc=H1Yb1swVokkQ7kNvwFVJkbN&_nc_gid=1Rxzt_7ieI0E4JazIERARg&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfzhvGsyNtWGGkVRcovd1paNFZEkoKsuoEOpaORl1u70jQ&oe=69B4C943&_nc_sid=10d13b" },
    { name: "My Woman Special Classic Bouquet", description: "The ‘’My woman’ special classic.", price: 2500, imageUrl: "https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/649224020_17913613053324923_4924282994930053815_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QHqZhR2NnjbBLEAe1gp7hsHDVHgG_zlp6UeHPEsf5zyEtsOy-X6MafInXPB33RoyRs&_nc_ohc=bgpV9shqR1UQ7kNvwHWY9Vh&_nc_gid=Xa94kcKMGO90D5ATehdr8g&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfzVpklB3lGdAX-pOUfztm6pkUGWPTVwYkreuV8g9hInwg&oe=69B4BF10&_nc_sid=10d13b" },
    { name: "Women's Day Curated Bouquets", description: "Honor the women in your life with our specially curated bouquets.", price: 0, imageUrl: "https://scontent-iad3-1.cdninstagram.com/v/t51.71878-15/645636022_1640110984080805_3040853499252203023_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QFL1xZZ0RAYITHU8_BSYoM3as9lbDpZf_B7cFO0yMAf8PwAs0op0CWWJN-CoHITEF8&_nc_ohc=zrwQZ-X0zfoQ7kNvwHjxaEs&_nc_gid=pKZyj1hSc1jxYpiiTL2cAQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afzzd3qrS0qcapIMoCWEWy7ktrNgzJABOh7hzhQUlbgsSQ&oe=69B4CB3D&_nc_sid=10d13b" },
    { name: "Golden Tones Soft Blooms Bouquet", description: "Golden tones and soft blooms for your loved one.", price: 5000, imageUrl: "https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/640405774_17911567212324923_8599046239037845918_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QE9huEbqyRHrTu1VyCRuu0LjQKrbD2QyJA54m3qEgoAXovlPsN5kxKOCWjI-xoEqSU&_nc_ohc=5SttijLIi_4Q7kNvwFM81_B&_nc_gid=xJkSSLcifcX-RpUyETbBXA&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfxFwAmN-5pFUVUJjmBP0kdrDKfMj-L_iZ_IJTJDgttwjw&oe=69B4D330&_nc_sid=10d13b" },
    { name: "Moyo Package", description: "The ‘Moyo’ package includes: •a 50 stem rose bouquet • a 50 stem teddy bear •a box oh chocolates • a personalized card.", price: 6500, imageUrl: "https://scontent-phl2-1.cdninstagram.com/v/t51.82787-15/632063690_17910933033324923_684710918712712260_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-phl2-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QG__twrYY7ETaL4R4IiLe0Sh2Rn0kGU3gk51GN4zaqtDy5xup3nRunQdBA-RAiYfJM&_nc_ohc=MQRyemmI1u4Q7kNvwFde4qL&_nc_gid=Md-4QLU9xnnCZlCi807-4w&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfyXjjzjb4yKL16gGnyM5OvMUbtFhfOqcadmTJLHY6aDsA&oe=69B4DCF4&_nc_sid=10d13b" },
    { name: "Thoughtfully Created Package", description: "Thoughtfully created ready to make someone’s day.", price: 6500, imageUrl: "https://scontent-atl3-3.cdninstagram.com/v/t51.82787-15/641633916_17911570980324923_8077859780841083699_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGqX8TWcyG6WKHDYEykYiHGpwm6IzHhQVmH5GGgbKKdMzh3NUHoNP5znutpPXXVBQE&_nc_ohc=30lnBaNeKHMQ7kNvwFoGy9T&_nc_gid=iGdr19XAzAjUeTfAVRH2AQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afw5z9jNmKAsCHPKj75Juumk62z1vAMncfBg6G6cHvgESw&oe=69B4B8A3&_nc_sid=10d13b" },
    { name: "Women's Day Celebration Video", description: "To all the amazing women navigating life, Today we celebrate your strength.", price: 0, imageUrl: "https://scontent-lga3-1.cdninstagram.com/v/t51.71878-15/649675969_1492990285785375_2497090714252019883_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QEO3JYKAcd-kYtUEbOQq3Pr_GF543jb5_Vo6hTQGfaL-aKxKu99LpJQU6XIiG2P7rc&_nc_ohc=BS0Hs2pawZkQ7kNvwF87PYu&_nc_gid=LbasM07Qjrp0N9XcFsBLXw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfzD5dLsobUubOV8GkZl7dpVkR4yUGXCQDvLn96CqtPMFQ&oe=69B4BB12&_nc_sid=10d13b" },
    { name: "Petal Powered Happiness Bouquet", description: "Petal powered happiness starts here.", price: 3000, imageUrl: "https://scontent-lax7-1.cdninstagram.com/v/t51.82787-15/640870466_17911567551324923_3741917772683286045_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-lax7-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QHzGCFo1F5oqj7dVCwJOII6micQf1ZydgxTYUr3JkX8bzI-UI9M9YzgmosAnJ-AymY&_nc_ohc=MeyMYsU4rEoQ7kNvwF9Hh2v&_nc_gid=5SHdp_fRoeybbSd-5MpUrg&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afx0i2WJyYcMGAAZ1Yjfj11IdlTxd0Egs3A-usQTLD-FhA&oe=69B4DF82&_nc_sid=10d13b" },
    { name: "Soft Petals Bold Colors Bouquet", description: "Soft petals, bold colors, endless charm.", price: 2500, imageUrl: "https://scontent-lax7-1.cdninstagram.com/v/t51.82787-15/641687220_17911570476324923_1164860291988758736_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-lax7-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QHsHQB3XULidv-49FG8TOyRXQ2SNeiMJ0t9GoWUIM71BmcZ910i-I6PEJ3f3IE9YIE&_nc_ohc=oKkg1I9EJqoQ7kNvwGq9jum&_nc_gid=TVxwmdxXSFEFy1CIyhBR8Q&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afy_BpbIqd6f_aXSMcX5QfXpq3aOMMrZ5fuaFMkmnWdMYA&oe=69B4D54D&_nc_sid=10d13b" },
    { name: "A Dose of Joy Bouquet", description: "A dose of joy.", price: 3000, imageUrl: "https://scontent-det1-1.cdninstagram.com/v/t51.82787-15/640258924_17911564944324923_4643241326947111329_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-det1-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGCW2M9BLOZAm296Nbz2tz3c39EZxKL8vKQKb0K-UkuSIV0k1bZVSjNQM4GE4p7blg&_nc_ohc=zTrjq_UTgo0Q7kNvwEznzbz&_nc_gid=EmO18RjIVHJQ2U3Vv-VY3w&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfwKq3gCuPEtt_Q-D88uByjKPJvhvKCGzJfkZyV_OQUvxA&oe=69B4BCF4&_nc_sid=10d13b" },
    { name: "Penzi Package", description: "The Penzi package includes: •a 15 cm teddy bear •a 20 stems bouquet •a chocolate bar •a personalized card.", price: 3000, imageUrl: "https://scontent-atl3-3.cdninstagram.com/v/t51.82787-15/631823159_17910930834324923_4169078293041948846_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QE-I19DjoUnb9YVGAVSnBf_4qHCxKLhIPayQAMS7ndooPD87gq-2RSBTl-lAf3IuFU&_nc_ohc=CZQeX8Bsvq8Q7kNvwFNg9kX&_nc_gid=R433eaQDyvAAF7zahyhcTg&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afy85FdrJZsS4UpzF4F4YwcRGBWwbYcxcsRFOqMSM5FS9g&oe=69B4DCFD&_nc_sid=10d13b" },
    { name: "Mini Chocolate Box", description: "Mini chocolate box.", price: 2250, imageUrl: "https://instagram.ftpa1-2.fna.fbcdn.net/v/t51.82787-15/641653973_17911570716324923_3520024257321777217_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=instagram.ftpa1-2.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QGR8imasXxF-0AXCqmT9HWxNIk9Jt6K7Fed4lMjXBSFK1sSdW2lM7r0rLGSRF56ZT-gZuE0UlA82mcl5wpWHC7V&_nc_ohc=H0sptxW4aF0Q7kNvwGrGIbj&_nc_gid=xy3zJf_cIW54mOfRYDFCvg&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfwWSNfrM_8L0Rah9SFFGS-1bM36lM5Vr4LUvk6qrKVNKA&oe=69B4B2DC&_nc_sid=10d13b" },
    { name: "Cherry Blossom Serenity Bouquet", description: "Cherry blossom serenity.", price: 3000, imageUrl: "https://instagram.fyxe2-1.fna.fbcdn.net/v/t51.82787-15/640877233_17911613436324923_2509519019476368101_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=instagram.fyxe2-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QFGlYgJHas4omC5am2tTrj0BX2uQgx3KqNltgjTzmhp4IgAbj6898OtAM_2k_0ynJ0&_nc_ohc=zayLICKHSHcQ7kNvwF-PySk&_nc_gid=xQJLhaz9KMJl86n0hh7NbA&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afy8wUPpskhVn-rzrXqcgtAlEbnlU1S1Ns71irxsErAS7w&oe=69B4DAFE&_nc_sid=10d13b" },
    { name: "Volume Speaking Bouquet", description: "Brighten their week with a bouquet that speaks volumes.", price: 3000, imageUrl: "https://scontent-lax7-1.cdninstagram.com/v/t51.82787-15/641653679_17911613298324923_8954857725837246442_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-lax7-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QHXFxW4uB-4-Knp0Fv_S9mqDMu3RxY9PjDzAI_M4jEQyR0QTjRRiGdlu3HO6Pwd4NA&_nc_ohc=81Gz7GW7Z3YQ7kNvwHJZHSq&_nc_gid=jIjYLAbHm2FBRZqtu9yFTQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfydLwUjpB5_423ampkc8MCIyI3Uf_NMeF8uBnbj77d-FQ&oe=69B4AEA0&_nc_sid=10d13b" },
    { name: "Petal Powered Happiness Bouquet", description: "Petal powered happiness starts right here.", price: 2000, imageUrl: "https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/623285348_17908162389324923_4964576581009413611_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QHeKZaLHpZ5m1gZqn7deqQ9pt9B7m-AjQnHOYQ4WBYycPlfxzUqXafelpQGRc20RLE&_nc_ohc=1ElAku_9T3YQ7kNvwHj3bBK&_nc_gid=v9RpxbGY2rH0r_jJ5X41hQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afxw2UkMQ1ZDotz4ThCL23fLjytavurOcoN-2dBNj7wUWg&oe=69B4B484&_nc_sid=10d13b" },
    { name: "Breathtaking Bouquet", description: "A breathtaking bouquet for every moment!", price: 4000, imageUrl: "https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/623558539_17908162920324923_509540799123504118_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QENFCqHqEueAYRGSAeZP001371ebeKmlq73VpuLXluISN7mk9Xxs_oBq6WFbUFLOdA&_nc_ohc=zw4LgGVHfWMQ7kNvwFA8PIx&_nc_gid=mb0mKISgado7fUYTDGkmeA&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afx_aKKfBNXfkdkAZgyhn8FDqPAXjqhB4zDUsieby2Ay-A&oe=69B4B932&_nc_sid=10d13b" },
    { name: "Floral Magic Bouquet", description: "A little floral magic to brighten up their day?", price: 4500, imageUrl: "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/616188060_17906682141324923_5309205089187956690_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QFpjMwPzMkmnLmxgbDf9PMICj8FwQqYeGcvwfl7at82RYy69Xb7DzMzD9KwvbwkD6M&_nc_ohc=1qcm7cPEavsQ7kNvwHTXqFO&_nc_gid=r0TAQ9T14X9mjU0Jzx-BjQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afw-dsNiclPNMiwPHWAU9V7Yu4OQPW0D9zVSqofs30JvBQ&oe=69B4D940&_nc_sid=10d13b" },
    { name: "Cupid 'Will You Be My Valentine?' Package", description: "The Cupid ‘Will you be my valentine? ‘ is now available.", price: 0, imageUrl: "https://scontent-sjc6-1.cdninstagram.com/v/t51.71878-15/617378755_1300753108753501_6940627847917195692_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-sjc6-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QHVwdTy2WvR-fyC1yvMpEn43ipNi2JtUqm7Z3Pe8FgBq445Caa3qCA6nQs6sWOsYC_-St4cmnHVBmHJYLvZ8rAx&_nc_ohc=tQtPqzbpKAsQ7kNvwHmFwoR&_nc_gid=Qj5wElBBxjED_zZCDiOg1w&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfwKXS3cx8AWHIzjfrPhh5ySXjLpaL03sBIvS6ZHfKlLEA&oe=69B4BF4E&_nc_sid=10d13b" },
    { name: "Cute Flower Arrangement", description: "Cutie.", price: 0, imageUrl: "https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/628029711_18004789283852300_4543811571290516431_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QEnZ8v9NFP_ThYHptjI5PDxCDsXTNS3eaMdFWXFckD9PHAS_gieCBlBZstGHtS4g0WvZZ_Fp29MYD6nebVoRBAs&_nc_ohc=8X1ZUxV2yjwQ7kNvwFNIJuQ&_nc_gid=iP-ycMaHDMUJQfBZZtvUlw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfyxrwgWR-P3CSEB5KqfPDwJChRMqw-sQM3s8M_7-LPl4Q&oe=69B4AA2D&_nc_sid=10d13b" },
    { name: "Proposal Bouquet", description: "Pov: he asked the right way.", price: 15000, imageUrl: "https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/624161454_17908162809324923_2939723267393315305_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QE2w0HIW3gj4XLYBwpokkPP7ztQkBqK_bVGoVJKyP-EXbB0--vQHZs1ft5bO6mYtRE&_nc_ohc=UsJY2VldIfIQ7kNvwFzcjx9&_nc_gid=TMN7v3jO9iOdbPmzZ-zf1g&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfztCZxODE8FNhXySQUt_48fXKCUr83Vo0w7acnuUUEt4g&oe=69B4AD08&_nc_sid=10d13b" },
    { name: "Valentine's Ask Bouquet", description: "Don’t forget to ask her to be your valentine.", price: 0, imageUrl: "https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/618544451_17906859243324923_7404159109806584741_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGNIgPreT06zMEkckabSqMHfXsdxoZOprH7xwHkdS9KtDXf6CReGllyBv2MQjRxSto&_nc_ohc=HCsBDkf_Vl8Q7kNvwF2gM3q&_nc_gid=RxMLklxmH_Rzyi5cfhvOOg&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afw_L3OowGDEVSqQsduQUx2c_ohldWgT0hFrRz_jdzzu4A&oe=69B4CB87&_nc_sid=10d13b" },
    { name: "New Year Blooms", description: "Some blooms to kick off the year?", price: 0, imageUrl: "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-15/610791132_17905266510324923_7135752891061559173_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QF_jSf6dhgNd4YugzfaXrn3_tLrsNdWIcB0NZOBnyaCviJft15eKTi_JYF-4TXESzs&_nc_ohc=obeoXoCkfjYQ7kNvwEJCrMu&_nc_gid=9MYMZJyPqmJcNjbXschzOQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afwi3Q0YueKmyswFkzSosdToGiGVKYgFwkcSOfzcCPr9gg&oe=69B4DE5A&_nc_sid=10d13b" },
    { name: "My Lady Women's Month Special", description: "The ‘my lady ‘ women’s month special.", price: 3500, imageUrl: "https://instagram.fiad1-1.fna.fbcdn.net/v/t51.82787-15/648668703_17913613236324923_3811483697115348927_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=instagram.fiad1-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QGtRJmw2PK_QPQe14pkC1h6ExgNqWy7yCLKzhP3rI8_2mkXsnxg-2Tig6mlymVwot8&_nc_ohc=1FpBhirr-mgQ7kNvwF-k3k9&_nc_gid=c1bv_f-DsJYTaPJALo_APw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfyhHoSq44HldbV4q0KHJ06kb3Z-cSTgKyvw1uZ2HBrW0Q&oe=69B4C758&_nc_sid=10d13b" },
    { name: "Space Bloom Bouquet", description: "Let your space bloom-one bouquet at a time.", price: 3000, imageUrl: "https://scontent-ord5-1.cdninstagram.com/v/t51.82787-15/642461184_17911612869324923_545300092511256875_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QF-_JqQET6CrFnePjM4NBeW4fMY8nGW6Em7O9-O9v1J47NOT4lxxYcUYtEQie1WE08&_nc_ohc=5UatVA6XossQ7kNvwGI4PZ4&_nc_gid=kGgpyQfTPz5N9FAFQSKPgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfzEtnnzZMKQjou8ki9-OojaX8r2SOk3gMRbNcJJVEWUOQ&oe=69B4B671&_nc_sid=10d13b" }
  ]

  // 5. Mapping function with unique SKU and UNIQUE SLUG generation
  const productsToInsert = rawProducts.map((product, index) => {
    // Basic slug generation
    const slugBase = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    return {
      name: product.name,
      // 👉 FIX: Append index to slug to ensure database uniqueness
      slug: `${slugBase}-${index + 1}`, 
      description: product.description,
      priceKes: product.price,
      imageUrls: [product.imageUrl], 
      categoryId: mainCategory.id,
      sku: `BR-INSTA-${index + 1}` 
    }
  })

  // 6. Push to Supabase
  await prisma.product.createMany({
    data: productsToInsert,
  })

  console.log('✅ Database seeded successfully with 30 unique Instagram products!')
}

// 7. Execution and cleanup
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })