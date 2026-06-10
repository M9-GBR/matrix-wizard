import Matrix from "./matrixer-js/matrixer.js"

self.addEventListener("message", ev => {
    let type = ev.data.type

    function createMatFromObj(obj) {
        return new Matrix(obj.rows, obj.cols, obj.vals)
    }

    function getSimpleMatObj(mat) {
        return { rows: mat.rows, cols: mat.columns, vals: mat.values }
    }

    if (type == "query") {
        let { code, matObj } = ev.data,
            mat = createMatFromObj(matObj)

        switch (code) {
            case "ide": postMessage(mat.isIdentity); break
            case "sca": postMessage(mat.isScalar); break
            case "dia": postMessage(mat.isDiagonal); break
            case "nul": postMessage(mat.isNull); break
            case "sin": postMessage(mat.isSingular); break
            case "sym": postMessage(mat.isSymmetric); break
            case "upt": postMessage(mat.isUpperTriangular); break
            case "lot": postMessage(mat.isLowerTriangular); break
            case "rank": postMessage(mat.rank); break
            case "det": postMessage(mat.determinant); break
            case "nullity": postMessage(mat.nullity); break
        }
    } else if (type = "op") {
        let { op, params } = ev.data

        if (op == "add") {
            let { matObj1, matObj2, sub } = params,
                mat1 = createMatFromObj(matObj1), mat2 = createMatFromObj(matObj2)

            postMessage(getSimpleMatObj(mat1.add(mat2, sub)))
        } else if (op == "mul") {
            let { matObj1, matObj2 } = params,
                mat1 = createMatFromObj(matObj1), mat2 = createMatFromObj(matObj2)

            postMessage(getSimpleMatObj(mat1.multiply(mat2)))
        } else if (op == "mus") {
            let { matObj, scalar, reciprocal } = params,
                mat = createMatFromObj(matObj)

            postMessage(getSimpleMatObj(mat.multiplyByScalar(scalar, reciprocal)))
        } else if (op == "inv") {
            let { matObj } = params,
                mat = createMatFromObj(matObj),
                inv = mat.inverse

            if (inv) {
                postMessage(getSimpleMatObj(inv))
            } else postMessage({ type: "error", data: "Can't Find Inverse of Singular Matrix" })

        } else if (op == "tra") {
            let { matObj } = params,
                mat = createMatFromObj(matObj)

            postMessage(getSimpleMatObj(mat.transpose))
        } else if (op == "cof") {
            let { matObj, row, col } = params,
                mat = createMatFromObj(matObj)

            postMessage(mat.getCoFactor(row, col))
        } else if (op == "min") {
            let { matObj, row, col } = params,
                mat = createMatFromObj(matObj)

            postMessage(mat.getMinor(row, col))
        } else if (op == "com") {
            let { matObj } = params,
                mat = createMatFromObj(matObj)

            postMessage(getSimpleMatObj(mat.coFactorMatrix))
        } else if (op == "mim") {
            let { matObj } = params,
                mat = createMatFromObj(matObj)

            postMessage(getSimpleMatObj(mat.minorMatrix))
        } else if (op == "adj") {
            let { matObj } = params,
                mat = createMatFromObj(matObj)

            postMessage(getSimpleMatObj(mat.adjoint))
        } else if (op == "pow") {
            let { matObj, power, hadamard } = params,
                mat = createMatFromObj(matObj)

            if (mat.isSingular && +power < 0) postMessage("Can't raise singular matrices to negative powers")
            else postMessage(getSimpleMatObj(hadamard ? mat.hadamardPower(power) : mat.power(power)))
        } else if (op == "hadmul") {
            let { matObj1, matObj2 } = params,
                mat1 = createMatFromObj(matObj1), mat2 = createMatFromObj(matObj2)

            postMessage(getSimpleMatObj(mat1.hadamardMultiply(mat2)))
        } else if (op == "submat") {
            let { matObj, point, rowI, colI, rowS, colS, rowE, colE } = params,
                mat = createMatFromObj(matObj)
            postMessage(getSimpleMatObj(point ? mat.getSubmatrix(rowI, colI) : mat.cutOut(rowS, colS, rowE, colE)))
        }
    }
})