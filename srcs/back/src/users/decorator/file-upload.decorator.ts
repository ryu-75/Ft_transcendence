import { FileInterceptor } from '@nestjs/platform-express'
import { NotAcceptableException, UseInterceptors } from '@nestjs/common'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { randomUUID } from 'crypto'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: join(__dirname, '..', '..', '..', 'uploads'),
    filename: (req, file, cb) => {
      const uniqueSuffix = randomUUID()
      const fileExtension = extname(file.originalname)
      cb(null, uniqueSuffix + fileExtension)
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new NotAcceptableException('Only image files are allowed'),
        false,
      )
    } else if (
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/png'
    ) {
      return cb(
        new NotAcceptableException('Only jpeg and png files are allowed'),
        false,
      )
    }
    cb(null, true)
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2 MB
  },
}

export const UploadUserImage = () => {
  return UseInterceptors(FileInterceptor('image', multerOptions))
}
