export default class Matrix {
    /**@type number[] */
    #values 
    #rows 
    #columns

    /**
     * Gets the elements of this matrix row by row and returns it in an array.
     * It can also be used to modify all the elements of the array by assigning an array with (rows x columns) length to this property.
    */
    get values() {
        return [...this.#values]
    }
    set values(values) {
        if (values.length == this.rows * this.columns) this.#values = values
        else throw new Error('The length of the array must be (rows * columns) of the matrix.')
    }

    /**Gets the dimensions of this matrix in the format: "rowsxcolumns". */
    get dimensions() { return this.#rows + 'x' + this.#columns }
    /**The amount of rows this matrix has. */
    get rows() { return this.#rows }
    /**The amount of columns this matrix has. */
    get columns() { return this.#columns }
    /**Returns a boolean value indicating whether this matrix is a square matrix. */
    get isSquare() { return this.#columns == this.#rows }
    /**Returns a boolean value indicating whether this matrix is a null matrix. */
    get isNull() { return this.#values.every(v => v == 0) }
    /**Returns a boolean value indicating whether this matrix is a row matrix. */
    get isRowMatrix() { return this.rows == 1 }
    /**Returns a boolean value indicating whether this matrix is a column matrix. */
    get isColumnMatrix() { return this.columns == 1 }
    /**Returns a boolean value indicating whether this matrix is symmetric. */
    get isSymmetric() { return this.equal(this.transpose) }
    /**Returns a boolean value indicating whether this matrix is singular.*/
    get isSingular() { return this.determinant == 0 }
    /**Returns a boolean value indicating whether this matrix is an identity matrix.*/
    get isIdentity() {
        return this.isSquare && this.rowArr.every((row, i) => {
            return row.every((v, j) => (i == j && v == 1) || (i != j && v == 0))
        })
    }
    /**Returns a boolean value indicating whether this matrix is a scalar matrix. */
    get isScalar() {
        return this.isSquare && this.rowArr.every((row, i) => {
            return row.every((val, j) => i == j ? val == this.#values[0] : val == 0)
        })
    }
    /**Returns a boolean value indicating whether this matrix is a diagonal matrix. */
    get isDiagonal() {
        return this.isSquare && this.rowArr.every((row, i) => {
            return row.every((val, j) => i == j ? true : val == 0)
        })
    }
    /**Returns a boolean value indicating whether this matrix is an upper triangular matrix. */
    get isUpperTriangular() {
        return this.isSquare && this.colArr.every((col, i) => {
            return col.every((val, j) => j < i + 1 || val == 0)
        })
    }
    /**Returns a boolean value indicating whether this matrix is a lower triangular matrix. */
    get isLowerTriangular() {
        return this.isSquare && this.rowArr.every((row, i) => {
            return row.every((val, j) => j < i + 1 || val == 0)
        })
    }

    /**Gets each row of this matrix in an array and returns all in a 2D array.*/
    get rowArr() {
        let rows = []

        for (let i = 0; i < this.rows; i++) {
            rows.push(this.#values.slice(i * this.columns, i * this.columns + this.columns))
        }

        return rows
    }

    /**Gets each column of this matrix in an array and returns all in a 2D array.*/
    get colArr() {
        /**@type number[] */
        let columns = []

        for (let i = 0; i < this.columns; i++) {
            columns.push([])
        }

        for (const row of this.rowArr) {
            for (let i = 0; i < row.length; i++) {
                columns[i].push(row[i])
            }
        }

        return columns
    }

    /**Returns the transpose of this matrix. */
    get transpose() {
        return new Matrix(this.columns, this.rows, [].concat(...this.colArr))
    }

    /**
     * Returns the determinant of this matrix.
     * @returns {number | undefined}
     */
    get determinant() {
        if (this.isSquare) {
            if (this.#values.length == 1) return this.get(1, 1)
            else if (this.#values.length == 0) return 1

            return this.rowArr[0].map((val, i) => val * this.getCoFactor(1, i + 1)).reduce((a, b) => a + b)
        }
    }

    /**
     * Returns the matrix of cofactors of this matrix.
     * @returns {number | undefined}
     */
    get coFactorMatrix() {
        if (this.isSquare) {
            let coFactors = []

            this.rowArr.forEach((row, rI) => {
                row.forEach((_, cI) => {
                    coFactors.push(this.getCoFactor(rI + 1, cI + 1))
                })
            })

            return new Matrix(this.#rows, this.#columns, coFactors)
        }
    }

    /**
     * Returns the matrix of minors of this matrix.
     * @returns {Matrix | undefined}
     */
    get minorMatrix() {
        if (this.isSquare) {
            let arr = []

            this.rowArr.forEach((row, rI) => {
                row.forEach((_, cI) => {
                    arr.push(this.getMinor(rI + 1, cI + 1))
                })
            })

            return new Matrix(this.#rows, this.#columns, arr)
        }
    }

    /**
     * Returns the inverse of this matrix.
     * @returns {Matrix | undefined}
     */
    get inverse() {
        let det = this.determinant
        if (det != 0) return this.adjoint.multiplyByScalar(det, true, false)
    }

    /**
     * Returns the adjoint of this matrix.
     * @returns {Matrix | undefined}
     */
    get adjoint() {
        if (this.isSquare) {
            return new Matrix(this.rows, this.columns, this.coFactorMatrix.values).transpose
        }
    }

    /**Gets a clone of this matrix. */
    get clone() {
        return new Matrix(this.#rows, this.#columns, this.#values)
    }

    /**Returns the rank of this matrix. */
    get rank() {
        if (this.isNull) return 0

        let minDim = Math.min(this.#rows, this.#columns),
            curRow = 1, curCol = 1

        while (minDim > 0) {
            let det = this.cutOut(curRow, curCol, curRow + minDim - 1, curCol + minDim - 1).determinant

            if (det != 0) break
            else {
                if ((curRow + minDim - 1 == this.rows) && (curCol + minDim - 1 == this.columns)) {
                    minDim--
                    curRow = 1
                    curCol = 1
                } else if (curCol + minDim - 1 == this.columns) {
                    curRow++
                    curCol = 1
                } else curCol++
            }
        }

        return minDim
    }

    /**Returns the nullity of this matrix. */
    get nullity() {
        return this.columns - this.rank
    }

    /** 
     * Create a new matrix object.
     * @param {number[]} values @param {number} columns @param {number} rows
     */
    constructor(rows = 0, columns = 0, values = []) {
        this.#rows = rows
        this.#columns = columns
        this.values = values
    }

    /**Returns an identity matrix of the specified size.*/
    static getIndentity(size = 2) {
        return Matrix.getScalar(size, 1)
    }

    /**Creates a scalar matrix with the specified value at the diagonal and returns it. */
    static getScalar(size = 2, scalar = 1) {
        let mat = Matrix.getNull(size)

        for (let i = 0; i < size; i++) {
            mat.set(i + 1, i + 1, scalar)
        }

        return mat
    }

    /**Creates a null matrix with the specified dimensions and returns it. */
    static getNull(rows = 2, columns = rows) {
        return new Matrix(rows, columns, new Array(rows * columns).fill(0))
    }

    /**Creates a diagonal matrix with the specified values at the diagonal. */
    static getDiagonal(...values) {
        let mat = Matrix.getNull(values.length)

        for (let i = 0; i < values.length; i++) {
            mat.set(i + 1, i + 1, values[i])
        }

        return mat
    }

    /**Creates a matrix with the specified dimensions and fills it with values between `min` and `max`.*/
    static random(rows = 2, columns = 2, min = -10, max = 10) {
        let arr = new Array(rows * columns).fill()
        arr.forEach((_, i) => arr[i] = Math.round(Math.random() * (max - min)) + min)

        return new Matrix(rows, columns, arr)
    }

    /**
     * Gets the minor of a certain element in the matrix. 
     * @param {number} rowIndex The row of the element
     * @param {number} colIndex The column of the element
     */
    getMinor(rowIndex, colIndex) {
        if (this.isSquare) return this.getSubmatrix(rowIndex, colIndex).determinant
    }

    /**
     * Returns the cofactor of a certain element in thr matrix.
     * @param {number} rowIndex The row of the element
     * @param {number} colIndex The column of the element
     */
    getCoFactor(rowIndex, colIndex) {
        return this.getMinor(rowIndex, colIndex) * ((rowIndex + colIndex) % 2 ? -1 : 1)
    }

    /**
     * Multiplies this matrix with `scalar`.
     * @param {number} scalar The scalar to multiply the matrix with.
     * @param reciprocal If true, multiplies the matrix with the reciprocal of the scalar.
     * @param modify If set to true, this matrix will be modified and no matrix will be returned.
     * @returns {Matrix | undefined}
     */
    multiplyByScalar(scalar = 1, reciprocal = false, modify = false) {
        scalar = reciprocal ? 1 / scalar : scalar
        let newArr = this.#values.map(v => v * scalar)

        if (modify) this.#values = newArr
        else return new Matrix(this.rows, this.columns, newArr)
    }

    /**Checks if this matrix can add the given matrix @param {Matrix} matrix  */
    canAdd(matrix) { return this.dimensions == matrix.dimensions }
    /**
     * Adds this matrix with another matrix and returns the new matrix. 
     * @param {Matrix} matrix 
     * @param subtract Multiplies the input matrix by -1 before adding.
     */
    add(matrix, subtract = false) {
        if (this.canAdd(matrix)) {
            return new Matrix(this.rows, this.columns, this.#values.map((v, i) => v + (matrix.#values[i] * (subtract ? -1 : 1))))
        }

        throw new Error('Matrices must be of thesame dimensions to perform an addition operation.')
    }

    /**Checks if this matrix can multiply with another matrix. @param {Matrix} matrix */
    canMultiply(matrix) { return this.columns == matrix.rows }
    /**Multiplies this matrix with another matrix and returns the new matrix. @param {Matrix} matrix  */
    multiply(matrix) {
        if (this.canMultiply(matrix)) {
            let valArr = []

            this.rowArr.forEach(row => {
                let rcSum = 0

                matrix.colArr.forEach(col => {
                    row.forEach((v, i) => rcSum += v * col[i])
                    valArr.push(rcSum)
                    rcSum = 0
                })
            })

            return new Matrix(this.rows, matrix.columns, valArr)
        }

        throw new Error('The first matrix must have thesame number of columns as the number of rows in the second matrix to perform a multiplication operation.')
    }

    /**
     * Checks if this matrix can perform a hadamard multiplication with another matrix.
     * @param {Matrix} matrix 
     */
    canMultiplyHadamard(matrix) { return this.canAdd(matrix) }
    /**
     * Performs a hadamard multiplication operation with this matrix and another and returns the new Matrix.
     * @param {Matrix} matrix 
     */
    hadamardMultiply(matrix) {
        if (this.canMultiplyHadamard(matrix)) return new Matrix(this.#rows, this.#columns, this.values.map((v, i) => v * matrix.#values[i]))
        throw new Error("Matrices must be of thesame dimensions to perform a hadamard multiplication operation.")
    }

    /**
     * Multiplies this matrix with itself `power` times and returns the new matrix. Only works on square matrices.
     * @param power The number of times to run the multipication. Floating point numbers will be converted to integers.
     * @returns {Matrix | undefined}
     */
    power(power = 1) {
        power = Math.floor(power)

        if (this.isSquare) {
            if (power == 0) return Matrix.getIndentity(this.#rows)
            else if (power > 0) {
                for (let i = 1, mat; i <= power; i++) {
                    mat ? mat = mat.multiply(this) : mat = this.clone
                    if (i == power) return mat
                }
            } else return this.power(Math.abs(power)).inverse
        }
    }

    /**
     * Raises all elements of this matrix to the given power and returns a new matrix with the new elements.
     * @param power The exponenent to raise the elements to.
     */
    hadamardPower(power = 1) {
        return new Matrix(this.#rows, this.#columns, this.#values.map(v => Math.pow(v, power)))
    }

    /**Checks if this matrix and another are equal i.e have thesame number of rows and columns and the same order of values. @param {Matrix} matrix */
    equal(matrix) {
        return this.dimensions == matrix.dimensions &&
            this.#values.every((v, i) => v == matrix.#values[i])
    }

    /** Retrieves an element at the given position of the matrix. 
     * @param {number} rowIndex The position of the row the element is located at. Not zero based.
     * @param {number} colIndex The position of the column the element is located at. Not zero based.
     */
    get(rowIndex, colIndex) {
        return this.#values[this.columns * rowIndex - (this.columns - colIndex) - 1]
    }

    /** Modifies an element at the given position of the matrix.
     * @param {number} rowIndex The position of the row the element is located at. Not zero based.
     * @param {number} colIndex The position of the column the element is located at. Not zero based.
     * @param {number} value The value to modify it with.
     */
    set(rowIndex, colIndex, value) {
        this.#values[this.columns * rowIndex - (this.columns - colIndex) - 1] = value
    }

    /**Gets the values in the row of the given index in this matrix and returns it in an array. @param {number} index  */
    getRow(index) {
        return this.rowArr[index - 1]
    }
    /**Gets the values in the column of the given index in this matrix and returns it in an array. @param {number} index  */
    getColumn(index) {
        return this.colArr[index - 1]
    }

    /**Iterates through all elements of this matrix. @param {(value: number, row: number, col: number) => {}} cb  */
    iterate(cb) {
        this.rowArr.forEach((row, rI) => row.forEach((v, cI) => cb(v, rI + 1, cI + 1)))
    }

    /**
     * Slices out a section of a matrix and returns it in a new matrix.
     * @param {number} rowStart The row index to start the slicing from.
     * @param {number} colStart The column index to start the slicing from.
     * @param {number} rowEnd The row index where the slicing should stop.
     * @param {number} colEnd The column index where the slicing should stop.
     */
    cutOut(rowStart, colStart, rowEnd, colEnd) {
        if (rowStart > 0 && colStart > 0 && rowEnd >= rowStart && colEnd >= colStart && rowEnd <= this.rows && colEnd <= this.columns) {
            let newArr = []

            this.iterate((v, rI, cI) => {
                if (rI >= rowStart && rI <= rowEnd && cI >= colStart && cI <= colEnd) newArr.push(v)
            })

            return new Matrix(rowEnd - rowStart + 1, colEnd - colStart + 1, newArr)
        }

        throw new Error("The parameters must be within range of the matrix's dimensions and start values must be less than end values.")
    }

    /**
     * Returns a new matrix ommitting all values at `rowIndex` or at `colIndex`.
     * @param {*} rowIndex The row to omit values from.
     * @param {*} colIndex The column to omit values from.
     */
    getSubmatrix(rowIndex, colIndex) {
        let newArr = []

        this.iterate((v, rI, cI) => {
            if (rI != rowIndex && cI != colIndex) newArr.push(v)
        })

        return new Matrix(this.rows - 1, this.columns - 1, newArr)
    }
}