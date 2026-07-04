# delete-cloudinary-image

Устгасан зар/хүсэлтийн зургийг Cloudinary-с бодитоор устгах Supabase Edge Function.

Cloudinary-ийн API Secret-ийг frontend (browser) дээр хэзээ ч ил гаргаж болохгүй тул
устгах үйлдлийг зөвхөн энэ серверийн функцээр дамжуулан хийнэ.

## Deploy хийх алхмууд

1. Supabase CLI суулгасан эсэхээ шалгана:
   ```
   npm install -g supabase
   ```

2. Төслийн folder-т орж, Supabase-тэй холбоно:
   ```
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Cloudinary-ийн нууц түлхүүрүүдийг Edge Function secret болгож тохируулна
   (эдгээрийг Cloudinary Console > Settings > Security хэсгээс авна):
   ```
   supabase secrets set CLOUDINARY_CLOUD_NAME=таны-cloud-name
   supabase secrets set CLOUDINARY_API_KEY=таны-api-key
   supabase secrets set CLOUDINARY_API_SECRET=таны-api-secret
   ```

4. Функцийг deploy хийнэ:
   ```
   supabase functions deploy delete-cloudinary-image
   ```

Deploy хийсний дараа admin самбараас зар эсвэл худалдан авах хүсэлт устгах бүрд
холбогдох зургууд Cloudinary-ийн Media Library-с бодитоор устгагдана.

## Шалгах

Админ самбараас зар устгаад, Cloudinary Media Library-г шинэчлэхэд (refresh)
зурган карт устсан байх ёстой.

